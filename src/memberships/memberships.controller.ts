import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { MembershipsService } from './memberships.service';
import {
  CreateMembershipPlanDto,
  UpdateMembershipPlanDto,
  PurchaseMembershipDto,
} from './dto/membership.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('memberships')
export class MembershipsController {
  constructor(private readonly membershipsService: MembershipsService) {}

  // ============ PUBLIC ENDPOINTS ============

  @Get('plans')
  async getAllPlans() {
    return this.membershipsService.getAllPlans(true);
  }

  @Get('plans/:id')
  async getPlanById(@Param('id') id: string) {
    const plan = await this.membershipsService.getPlanById(+id);
    if (!plan) throw new BadRequestException('Plan not found');
    return plan;
  }

  // ============ CLIENT ENDPOINTS (Authenticated) ============

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  async purchaseMembership(
    @Body() dto: PurchaseMembershipDto,
    @Req() req: any,
  ) {
    if (!req.user?.user_id) {
      throw new BadRequestException('User not authenticated');
    }
    return this.membershipsService.purchaseMembership(req.user.user_id, dto);
  }

  @Get('my-subscriptions')
  @UseGuards(JwtAuthGuard)
  async getMySubscriptions(@Req() req: any) {
    if (!req.user?.user_id) {
      throw new BadRequestException('User not authenticated');
    }
    return this.membershipsService.getUserSubscriptions(req.user.user_id);
  }

  @Get('my-active')
  @UseGuards(JwtAuthGuard)
  async getMyActiveSubscription(@Req() req: any) {
    if (!req.user?.user_id) {
      throw new BadRequestException('User not authenticated');
    }
    return this.membershipsService.getActiveSubscription(req.user.user_id);
  }

  // ============ ADMIN ENDPOINTS ============

  @Post('admin/plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async createPlan(@Body() dto: CreateMembershipPlanDto) {
    return this.membershipsService.createPlan(dto);
  }

  @Put('admin/plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async updatePlan(
    @Param('id') id: string,
    @Body() dto: UpdateMembershipPlanDto,
  ) {
    return this.membershipsService.updatePlan(+id, dto);
  }

  @Delete('admin/plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async deletePlan(@Param('id') id: string) {
    await this.membershipsService.deletePlan(+id);
    return { success: true };
  }

  @Get('admin/subscriptions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getAllSubscriptions() {
    return this.membershipsService.getAllSubscriptions();
  }

  @Get('admin/subscriptions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async getSubscriptionById(@Param('id') id: string) {
    const sub = await this.membershipsService.getSubscriptionById(+id);
    if (!sub) throw new BadRequestException('Subscription not found');
    return sub;
  }

  @Delete('admin/subscriptions/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async cancelSubscription(@Param('id') id: string) {
    return this.membershipsService.cancelSubscription(+id);
  }
}
