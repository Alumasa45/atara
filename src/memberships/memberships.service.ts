import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MembershipPlan } from './entities/membership-plan.entity';
import { MembershipSubscription } from './entities/membership-subscription.entity';
import {
  CreateMembershipPlanDto,
  UpdateMembershipPlanDto,
  PurchaseMembershipDto,
} from './dto/membership.dto';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(MembershipPlan)
    private readonly planRepository: Repository<MembershipPlan>,
    @InjectRepository(MembershipSubscription)
    private readonly subscriptionRepository: Repository<MembershipSubscription>,
  ) {}

  // ============ PLANS ============

  async createPlan(dto: CreateMembershipPlanDto) {
    const plan = this.planRepository.create({
      name: dto.name,
      description: dto.description,
      classes_included: dto.classes_included,
      duration_days: dto.duration_days,
      price: dto.price,
      benefits: JSON.stringify(dto.benefits),
      sort_order: dto.sort_order ?? 1,
    });
    return this.planRepository.save(plan);
  }

  async getAllPlans(activeOnly: boolean = true) {
    const query = this.planRepository.createQueryBuilder('p');
    if (activeOnly) {
      query.where('p.is_active = :active', { active: true });
    }
    return query.orderBy('p.sort_order', 'ASC').getMany();
  }

  async getPlanById(id: number) {
    return this.planRepository.findOne({ where: { plan_id: id } });
  }

  async updatePlan(id: number, dto: UpdateMembershipPlanDto) {
    const plan = await this.planRepository.findOne({ where: { plan_id: id } });
    if (!plan) throw new Error('Plan not found');

    if (dto.name) plan.name = dto.name;
    if (dto.description) plan.description = dto.description;
    if (dto.classes_included) plan.classes_included = dto.classes_included;
    if (dto.duration_days) plan.duration_days = dto.duration_days;
    if (dto.price) plan.price = dto.price;
    if (dto.benefits) plan.benefits = JSON.stringify(dto.benefits);
    if (dto.is_active !== undefined) plan.is_active = dto.is_active;
    if (dto.sort_order !== undefined) plan.sort_order = dto.sort_order;

    return this.planRepository.save(plan);
  }

  async deletePlan(id: number) {
    const plan = await this.planRepository.findOne({ where: { plan_id: id } });
    if (!plan) throw new Error('Plan not found');
    return this.planRepository.remove(plan);
  }

  // ============ SUBSCRIPTIONS ============

  async purchaseMembership(userId: number, dto: PurchaseMembershipDto) {
    const plan = await this.planRepository.findOne({
      where: { plan_id: dto.plan_id },
    });
    if (!plan) throw new Error('Plan not found');

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.duration_days);

    const subscription = this.subscriptionRepository.create({
      user_id: userId,
      plan_id: plan.plan_id,
      start_date: startDate,
      end_date: endDate,
      classes_remaining: plan.classes_included,
      status: 'active',
      payment_reference: dto.payment_reference,
    });

    return this.subscriptionRepository.save(subscription);
  }

  async getUserSubscriptions(userId: number) {
    return this.subscriptionRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.plan', 'plan')
      .where('s.user_id = :userId', { userId })
      .orderBy('s.start_date', 'DESC')
      .getMany();
  }

  async getActiveSubscription(userId: number) {
    const now = new Date();
    return this.subscriptionRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.plan', 'plan')
      .where('s.user_id = :userId', { userId })
      .andWhere('s.status = :status', { status: 'active' })
      .andWhere('s.end_date >= :now', { now })
      .orderBy('s.end_date', 'DESC')
      .getOne();
  }

  async deductClass(userId: number): Promise<boolean> {
    const subscription = await this.getActiveSubscription(userId);
    if (!subscription || subscription.classes_remaining <= 0) {
      return false;
    }

    subscription.classes_remaining -= 1;
    if (subscription.classes_remaining === 0) {
      subscription.status = 'expired';
    }

    await this.subscriptionRepository.save(subscription);
    return true;
  }

  async getAllSubscriptions() {
    return this.subscriptionRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.plan', 'plan')
      .leftJoinAndSelect('s.user', 'user')
      .orderBy('s.created_at', 'DESC')
      .getMany();
  }

  async getSubscriptionById(id: number) {
    return this.subscriptionRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.plan', 'plan')
      .leftJoinAndSelect('s.user', 'user')
      .where('s.subscription_id = :id', { id })
      .getOne();
  }

  async cancelSubscription(id: number) {
    const subscription = await this.subscriptionRepository.findOne({
      where: { subscription_id: id },
    });
    if (!subscription) throw new Error('Subscription not found');

    subscription.status = 'cancelled';
    return this.subscriptionRepository.save(subscription);
  }
}
