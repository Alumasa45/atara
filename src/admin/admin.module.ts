import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Admin } from './entities/admin.entity';
import { User } from '../users/entities/user.entity';
import { Trainer } from '../trainers/entities/trainer.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Session } from '../sessions/entities/session.entity';
import { Schedule } from '../schedule/entities/schedule.entity';
import { ScheduleTimeSlot } from '../schedule/entities/schedule-time-slot.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Admin,
      User,
      Trainer,
      Booking,
      Session,
      Schedule,
      ScheduleTimeSlot,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
