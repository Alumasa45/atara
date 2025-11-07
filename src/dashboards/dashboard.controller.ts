import {
  Controller,
  Get,
  UseGuards,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  /**
   * Client dashboard: their bookings, profile, stats
   */
  @Get('test')
  async testDashboard() {
    return { message: 'Dashboard endpoint working', timestamp: new Date() };
  }

  @Get('client')
  @UseGuards(JwtAuthGuard)
  async getClientDashboard(@Req() req: any) {
    try {
      const user = req.user;
      console.log('Dashboard client request - user:', user);
      
      if (!user) {
        throw new ForbiddenException('User not authenticated');
      }
      
      const userId = user.userId || user.user_id || user.sub;
      console.log('Dashboard client request - userId:', userId);
      
      if (!userId) {
        throw new ForbiddenException('User ID not found');
      }
      
      // Call the actual dashboard service
      return await this.dashboardService.getClientDashboard(userId);
    } catch (error) {
      console.error('Dashboard controller error:', error);
      throw error;
    }
  }

  /**
   * Trainer dashboard: their sessions, bookings, earnings
   */
  @Get('trainer')
  @UseGuards(JwtAuthGuard)
  async getTrainerDashboard(@Req() req: any) {
    const user = req.user;
    if (!user || user.role !== 'trainer') {
      throw new ForbiddenException('Only trainers can access this endpoint');
    }
    return await this.dashboardService.getTrainerDashboard(user.userId);
  }

  /**
   * Manager dashboard: system statistics
   */
  @Get('manager')
  @UseGuards(JwtAuthGuard)
  async getManagerDashboard(@Req() req: any) {
    const user = req.user;
    if (!user || user.role !== 'manager') {
      throw new ForbiddenException('Only managers can access this endpoint');
    }
    return await this.dashboardService.getManagerDashboard();
  }

  /**
   * Admin dashboard: full system overview
   */
  @Get('admin')
  @UseGuards(JwtAuthGuard)
  async getAdminDashboard(@Req() req: any) {
    const user = req.user;
    if (!user || user.role !== 'admin') {
      throw new ForbiddenException('Only admins can access this endpoint');
    }
    return await this.dashboardService.getAdminDashboard();
  }
}
