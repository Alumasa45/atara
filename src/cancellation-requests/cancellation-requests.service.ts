import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CancellationRequest,
  CancellationRequestStatus,
} from './entities/cancellation-request.entity';
import { BookingsService } from '../bookings/bookings.service';
import { Booking } from '../bookings/entities/booking.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CancellationRequestsService {
  constructor(
    @InjectRepository(CancellationRequest)
    private readonly reqRepo: Repository<CancellationRequest>,
    private readonly bookingsService: BookingsService,
    @InjectRepository(Booking)
    private readonly bookingRepo: Repository<Booking>,
  ) {}

  async create(bookingId: number, requester: User, message?: string) {
    const booking = await this.bookingRepo.findOne({
      where: { booking_id: bookingId },
      relations: ['user'],
    });
    if (!booking) throw new NotFoundException('Booking not found');

    // only the booking owner or admin can create a cancellation request
    if (requester.role === 'client') {
      if (!booking.user_id || booking.user_id !== requester.user_id) {
        throw new ForbiddenException('Not your booking');
      }
    }

    const r = this.reqRepo.create({
      booking,
      requester,
      message,
      status: CancellationRequestStatus.pending,
    });
    return this.reqRepo.save(r);
  }

  async listAll() {
    return this.reqRepo.find({
      relations: ['booking', 'requester', 'approver'],
    });
  }

  async approve(requestId: number, approver: User) {
    const req = await this.reqRepo.findOne({
      where: { id: requestId },
      relations: ['booking'],
    });
    if (!req) throw new NotFoundException('Request not found');

    // only admin can approve
    if (!approver || approver.role !== 'admin')
      throw new ForbiddenException('Only admin may approve');

    // perform booking cancellation (admin can bypass 24h rule)
    await this.bookingsService.cancel(req.booking_id, {
      role: 'admin',
      userId: approver.user_id,
    });

    req.status = CancellationRequestStatus.approved;
    req.approver = approver as any;
    return this.reqRepo.save(req);
  }

  async reject(requestId: number, approver: User, reason?: string) {
    const req = await this.reqRepo.findOne({ where: { id: requestId } });
    if (!req) throw new NotFoundException('Request not found');
    if (!approver || approver.role !== 'admin')
      throw new ForbiddenException('Only admin may reject');
    req.status = CancellationRequestStatus.rejected;
    req.approver = approver as any;
    if (reason) req.message = (req.message ?? '') + '\n[Admin note] ' + reason;
    return this.reqRepo.save(req);
  }
}
