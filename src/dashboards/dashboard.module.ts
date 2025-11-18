import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';
import { User } from '../users/entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Trainer } from '../trainers/entities/trainer.entity';
import { Schedule } from '../schedule/entities/schedule.entity';
import { ScheduleTimeSlot } from '../schedule/entities/schedule-time-slot.entity';
import { Session } from '../sessions/entities/session.entity';
import { CancellationRequest } from '../cancellation-requests/entities/cancellation-request.entity';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Booking,
      Trainer,
      Schedule,
      ScheduleTimeSlot,
      Session,
      CancellationRequest,
    ]),
    AuthModule,
    NotificationsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
