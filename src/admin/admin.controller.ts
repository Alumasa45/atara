import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  Request,
  Req,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  UpdateUserRoleDto,
  AdminQueryDto,
  CreateScheduleDto,
  UpdateScheduleDto,
  UpdateBookingStatusDto,
} from './dto/admin.dto';
import { status as bookingStatus } from '../bookings/entities/booking.entity';
import { CreateTrainerDto } from '../trainers/dto/create-trainer.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'manager')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * Get all admin statistics (accessible to admin and manager)
   */
  @Get('stats')
  @Roles('admin', 'manager')
  async getStats() {
    return this.adminService.getAdminStats();
  }

  /**
   * Get analytics data for charts (accessible to admin and manager)
   */
  @Get('analytics')
  @Roles('admin', 'manager')
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  /**
   * Get all users with pagination and filtering
   */
  @Get('users')
  async getAllUsers(@Query() query: AdminQueryDto) {
    return this.adminService.getAllUsers(query);
  }

  /**
   * Get single user by ID
   */
  @Get('users/:id')
  async getUserById(@Param('id', ParseIntPipe) userId: number) {
    return this.adminService.getUserById(userId);
  }

  /**
   * Update user role and status
   */
  @Patch('users/:id')
  async updateUserRole(
    @Param('id', ParseIntPipe) userId: number,
    @Body() updateDto: UpdateUserRoleDto,
  ) {
    return this.adminService.updateUserRole(userId, updateDto);
  }

  /**
   * Get user activity summary
   */
  @Get('users/:id/activity')
  async getUserActivity(@Param('id', ParseIntPipe) userId: number) {
    return this.adminService.getUserActivitySummary(userId);
  }

  /**
   * Deactivate user account
   */
  @Patch('users/:id/deactivate')
  async deactivateUser(
    @Param('id', ParseIntPipe) userId: number,
    @Request() req,
  ) {
    return this.adminService.deactivateUser(userId, req.user.user_id);
  }

  /**
   * Activate user account
   */
  @Patch('users/:id/activate')
  async activateUser(@Param('id', ParseIntPipe) userId: number) {
    return this.adminService.activateUser(userId);
  }

  /**
   * Delete user account
   */
  @Delete('users/:id')
  async deleteUser(@Param('id', ParseIntPipe) userId: number, @Request() req) {
    return this.adminService.deleteUser(userId, req.user.user_id);
  }

  /**
   * Debug endpoint: check current user's role
   */
  @Get('debug/whoami')
  async whoami(@Req() req: any) {
    console.log('🔍 [AdminController /admin/debug/whoami] request received');
    console.log('📋 req.user payload:', req.user);
    console.log('👤 User role:', req.user?.role);
    console.log('🎯 Required roles: ["admin"]');
    return {
      message: 'Current user info',
      payload: req.user,
      role: req.user?.role,
      isAdmin: req.user?.role === 'admin',
    };
  }

  /**
   * Debug endpoint: test database connectivity
   */
  @Get('debug/db-test')
  async dbTest() {
    console.log('🔍 [AdminController /admin/debug/db-test] request received');
    try {
      const result = await this.adminService.testDatabaseConnection();
      return result;
    } catch (error) {
      console.error('❌ Database test failed:', error);
      return {
        success: false,
        error: error.message,
        stack: error.stack
      };
    }
  }

  /**
   * Get all trainers with pagination and filtering
   */
  @Get('trainers')
  async getAllTrainers(@Query() query: AdminQueryDto) {
    console.log('🚀 [AdminController] GET /admin/trainers called');
    console.log('📋 Query params:', query);
    console.log('📝 Query keys:', Object.keys(query));
    const result = await this.adminService.getAllTrainers(query);
    console.log('✅ [AdminController] Returning trainers result');
    return result;
  }

  /**
   * Register/Create a new trainer
   */
  @Post('trainers')
  async registerTrainer(@Body() createTrainerDto: CreateTrainerDto) {
    console.log('🚀 [AdminController] POST /admin/trainers called');
    console.log('📋 Creating trainer:', createTrainerDto);
    const result = await this.adminService.createTrainer(createTrainerDto);
    console.log('✅ [AdminController] Trainer created:', result);
    return result;
  }

  /**
   * Get single trainer by ID
   */
  @Get('trainers/:id')
  async getTrainerById(@Param('id', ParseIntPipe) trainerId: number) {
    return this.adminService.getTrainerById(trainerId);
  }

  /**
   * Get all bookings with pagination and filtering
   */
  @Get('bookings')
  async getAllBookings(@Query() query: AdminQueryDto) {
    console.log('🚀 [AdminController] GET /admin/bookings called');
    console.log('📋 Query params:', query);
    console.log('📝 Query keys:', Object.keys(query));
    const result = await this.adminService.getAllBookings(query);
    console.log('✅ [AdminController] Returning bookings result');
    return result;
  }

  /**
   * Get all sessions with pagination and filtering
   */
  @Get('sessions')
  async getAllSessions(@Query() query: AdminQueryDto) {
    return this.adminService.getAllSessions(query);
  }

  /**
   * Get all schedules with pagination
   */
  @Get('schedules')
  async getAllSchedules(@Query() query: AdminQueryDto) {
    return this.adminService.getAllSchedules(query);
  }

  /**
   * Create a new schedule
   */
  @Post('schedules')
  async createSchedule(
    @Body() createScheduleDto: CreateScheduleDto,
    @Request() req,
  ) {
    return this.adminService.createSchedule(
      createScheduleDto,
      req.user.user_id,
    );
  }

  /**
   * Update an existing schedule
   */
  @Put('schedules/:id')
  async updateSchedule(
    @Param('id', ParseIntPipe) scheduleId: number,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.adminService.updateSchedule(scheduleId, updateScheduleDto);
  }

  /**
   * Delete a schedule
   */
  @Delete('schedules/:id')
  async deleteSchedule(@Param('id', ParseIntPipe) scheduleId: number) {
    return this.adminService.deleteSchedule(scheduleId);
  }

  /**
   * Update booking status (admin only)
   * Changes booking status and awards loyalty points if marked as completed
   */
  @Patch('bookings/:id/status')
  async updateBookingStatus(
    @Param('id', ParseIntPipe) bookingId: number,
    @Body() updateDto: UpdateBookingStatusDto,
  ) {
    return this.adminService.updateBookingStatus(bookingId, updateDto.status as bookingStatus, updateDto.payment_reference);
  }

  /**
   * Confirm payment reference and update booking to confirmed status
   */
  @Patch('bookings/:id/confirm-payment')
  async confirmPayment(
    @Param('id', ParseIntPipe) bookingId: number,
  ) {
    return this.adminService.confirmBookingPayment(bookingId);
  }

  /**
   * Create notifications table
   */
  @Post('create-notifications-table')
  async createNotificationsTable() {
    return this.adminService.createNotificationsTable();
  }
}
