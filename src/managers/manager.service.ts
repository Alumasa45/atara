import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Manager, ManagerStatus, ManagerRole } from './entities/manager.entity';
import { User } from '../users/entities/user.entity';
import {
  CreateManagerDto,
  UpdateManagerDto,
  ManagerQueryDto,
} from './dto/manager.dto';

@Injectable()
export class ManagerService {
  constructor(
    @InjectRepository(Manager)
    private readonly managerRepository: Repository<Manager>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createManager(createManagerDto: CreateManagerDto): Promise<Manager> {
    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { user_id: createManagerDto.user_id },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if manager already exists for this user
    const existingManager = await this.managerRepository.findOne({
      where: { user_id: createManagerDto.user_id },
    });
    if (existingManager) {
      throw new ConflictException('Manager already exists for this user');
    }

    const manager = this.managerRepository.create(createManagerDto);
    return await this.managerRepository.save(manager);
  }

  async getAllManagers(
    query: ManagerQueryDto,
  ): Promise<{ data: Manager[]; total: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.search) {
      // Search in manager department or user details
      return this.searchManagers(query.search, skip, limit);
    }

    if (query.manager_role) {
      where.manager_role = query.manager_role;
    }

    if (query.manager_status) {
      where.manager_status = query.manager_status;
    }

    if (query.center_id) {
      where.center_id = query.center_id;
    }

    const [data, total] = await this.managerRepository.findAndCount({
      where,
      relations: ['user'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { data, total };
  }

  private async searchManagers(
    search: string,
    skip: number,
    limit: number,
  ): Promise<{ data: Manager[]; total: number }> {
    const users = await this.userRepository.find({
      where: [
        { username: Like(`%${search}%`) },
        { email: Like(`%${search}%`) },
        { phone: Like(`%${search}%`) },
      ],
    });

    const userIds = users.map((u) => u.user_id);

    const [data, total] = await this.managerRepository.findAndCount({
      where: userIds.length > 0 ? { user_id: In(userIds) } : {},
      relations: ['user'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    return { data, total };
  }

  async getManagerById(manager_id: number): Promise<Manager> {
    const manager = await this.managerRepository.findOne({
      where: { manager_id },
      relations: ['user'],
    });

    if (!manager) {
      throw new NotFoundException('Manager not found');
    }

    return manager;
  }

  async getManagerByUserId(user_id: number): Promise<Manager> {
    const manager = await this.managerRepository.findOne({
      where: { user_id },
      relations: ['user'],
    });

    if (!manager) {
      throw new NotFoundException('Manager not found for this user');
    }

    return manager;
  }

  async updateManager(
    manager_id: number,
    updateManagerDto: UpdateManagerDto,
  ): Promise<Manager> {
    const manager = await this.getManagerById(manager_id);

    Object.assign(manager, updateManagerDto);
    return await this.managerRepository.save(manager);
  }

  async updateManagerStatus(
    manager_id: number,
    status: ManagerStatus,
  ): Promise<Manager> {
    const manager = await this.getManagerById(manager_id);
    manager.manager_status = status;
    return await this.managerRepository.save(manager);
  }

  async deleteManager(manager_id: number): Promise<{ message: string }> {
    const manager = await this.getManagerById(manager_id);
    await this.managerRepository.remove(manager);
    return { message: 'Manager deleted successfully' };
  }

  async getManagersByCenterId(center_id: number): Promise<Manager[]> {
    return await this.managerRepository.find({
      where: { center_id },
      relations: ['user'],
      order: { created_at: 'DESC' },
    });
  }

  async getManagerStats(): Promise<any> {
    const totalManagers = await this.managerRepository.count();
    const activeManagers = await this.managerRepository.count({
      where: { manager_status: ManagerStatus.ACTIVE },
    });
    const centerManagers = await this.managerRepository.count({
      where: { manager_role: ManagerRole.CENTER_MANAGER },
    });
    const regionalManagers = await this.managerRepository.count({
      where: { manager_role: ManagerRole.REGIONAL_MANAGER },
    });

    return {
      totalManagers,
      activeManagers,
      centerManagers,
      regionalManagers,
      inactiveManagers: totalManagers - activeManagers,
    };
  }

  async incrementTrainersCount(manager_id: number): Promise<void> {
    const manager = await this.getManagerById(manager_id);
    manager.trainers_count = (manager.trainers_count || 0) + 1;
    await this.managerRepository.save(manager);
  }

  async decrementTrainersCount(manager_id: number): Promise<void> {
    const manager = await this.getManagerById(manager_id);
    if (manager.trainers_count > 0) {
      manager.trainers_count -= 1;
      await this.managerRepository.save(manager);
    }
  }

  async updateLastAction(manager_id: number): Promise<void> {
    await this.managerRepository.update(manager_id, {
      last_action: new Date(),
    });
  }
}
