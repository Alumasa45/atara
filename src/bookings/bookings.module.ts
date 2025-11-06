import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from './entities/booking.entity';
import { SessionGroup } from '../session-groups/entities/session-group.entity';
import { Schedule } from '../schedule/entities/schedule.entity';
import { ScheduleTimeSlot } from '../schedule/entities/schedule-time-slot.entity';
import { User } from '../users/entities/user.entity';
import { Session } from '../sessions/entities/session.entity';
import { Trainer } from '../trainers/entities/trainer.entity';
import { AuthModule } from '../auth/auth.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      SessionGroup,
      Schedule,
      ScheduleTimeSlot,
      User,
      Session,
      Trainer,
    ]),
    ProfilesModule,
    // cancellation requests module lives alongside bookings
    // registered below to avoid circular import at AppModule
    AuthModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
