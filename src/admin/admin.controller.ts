import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { role } from '../users/entities/user.entity';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(role.admin)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('debug/db-test')
  async testDatabase() {
    return await this.adminService.testDatabaseConnection();
  }

  @Get('debug/whoami')
  async whoAmI(@Request() req) {
    return {
      user: req.user,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('debug/fix-notifications')
  async fixNotifications() {
    return await this.adminService.createNotificationsTable();
  }

  @Get('users')
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return await this.adminService.getAllUsers(page, limit);
  }

  @Get('trainers')
  async getAllTrainers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 100,
  ) {
    return await this.adminService.getAllTrainers(page, limit);
  }

  @Post('trainers')
  async createTrainer(@Body() createTrainerDto: any) {
    return await this.adminService.createTrainer(createTrainerDto);
  }

  @Get('schedules')
  async getAllSchedules() {
    return await this.adminService.getAllSchedules();
  }

  @Post('schedules')
  async createSchedule(@Body() createScheduleDto: any) {
    return await this.adminService.createSchedule(createScheduleDto);
  }

  @Patch('users/:id/suspend')
  async suspendUser(@Param('id') id: number) {
    return await this.adminService.suspendUser(id);
  }

  @Patch('users/:id/activate')
  async activateUser(@Param('id') id: number) {
    return await this.adminService.activateUser(id);
  }
}