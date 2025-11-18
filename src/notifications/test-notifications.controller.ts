import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('test-notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TestNotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('create-test')
  @Roles('admin')
  async createTestNotification(@Req() req: any) {
    try {
      console.log('🧪 Creating test notification...');
      
      // Create a test expense notification
      const testExpense = {
        expense_id: 999,
        name: 'Test Notification Expense',
        cost: 50.00
      };
      
      await this.notificationsService.createNewExpenseNotification(testExpense);
      
      return { success: true, message: 'Test notification created' };
    } catch (error) {
      console.error('❌ Test notification failed:', error);
      return { success: false, error: error.message };
    }
  }
}