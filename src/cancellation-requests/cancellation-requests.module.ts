import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CancellationRequestsService } from './cancellation-requests.service';
import { CancellationRequestsController } from './cancellation-requests.controller';
import { CancellationRequest } from './entities/cancellation-request.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingsModule } from '../bookings/bookings.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CancellationRequest, Booking]),
    BookingsModule,
    AuthModule,
  ],
  providers: [CancellationRequestsService],
  controllers: [CancellationRequestsController],
  exports: [CancellationRequestsService],
})
export class CancellationRequestsModule {}
