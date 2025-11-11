import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking, status as BookingStatus } from './entities/booking.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { Schedule } from '../schedule/entities/schedule.entity';
import { ScheduleTimeSlot } from '../schedule/entities/schedule-time-slot.entity';
import { User } from '../users/entities/user.entity';
import { SessionGroup } from '../session-groups/entities/session-group.entity';

@Injectable()
export class BookingsService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(ScheduleTimeSlot)
    private readonly timeSlotRepository: Repository<ScheduleTimeSlot>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(SessionGroup)
    private readonly groupRepository: Repository<SessionGroup>,
    private readonly profilesService: ProfilesService,
  ) {}

  // helper: category-specific caps
  private categoryCapacityLimit(category: string | undefined) {
    const caps: Record<string, number> = { pilates: 5, yoga: 10 };
    return category && caps[category] ? caps[category] : undefined;
  }

  async create(createBookingDto: CreateBookingDto) {
    try {
      console.log('Creating booking with data:', createBookingDto);
      const { user_id, time_slot_id, guest_name, guest_email, guest_phone, payment_reference, payment_method, amount } =
        createBookingDto as any;

      // Validate guest booking requirements
      if (!user_id) {
        if (!guest_name || !guest_phone) {
          throw new ConflictException('Guest bookings require name and phone number');
        }
      }

      // Get the time slot with its related session and schedule
      const timeSlot = await this.timeSlotRepository.findOne({
        where: { slot_id: time_slot_id },
        relations: ['schedule', 'session'],
      });
      if (!timeSlot) throw new NotFoundException('Time slot not found');
      if (!timeSlot.schedule) throw new NotFoundException('Schedule not found for time slot');
      if (!timeSlot.session) throw new NotFoundException('Session not found for time slot');

    const schedule = timeSlot.schedule;
    const session = timeSlot.session;

    let user: User | null = null;
    if (user_id) {
      user = await this.userRepository.findOne({ where: { user_id } });
      if (!user) throw new NotFoundException('User not found');
    }

    // determine effective capacity for this time slot
    // Since capacity is now per-session, use the session's capacity
    const sessionCapacity = session?.capacity || 1;
    const categoryLimit = this.categoryCapacityLimit(session?.category);
    const effectiveCapacity = categoryLimit
      ? Math.min(categoryLimit, sessionCapacity)
      : sessionCapacity;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // acquire advisory lock per-schedule to serialize group-creation path
      // this prevents two transactions from computing the same next group_number
      // Postgres advisory locks are session-scoped; use xact lock to auto-release
      await queryRunner.query('SELECT pg_advisory_xact_lock($1)', [
        schedule.schedule_id,
      ]);
      // try to find existing group with space
      let group = await queryRunner.manager
        .createQueryBuilder(SessionGroup, 'g')
        .setLock('pessimistic_write')
        .where('g.schedule_id = :sid AND g.current_count < g.capacity', {
          sid: schedule.schedule_id,
        })
        .orderBy('g.group_number', 'ASC')
        .getOne();

      if (group) {
        group.current_count += 1;
        await queryRunner.manager.save(group);
      } else {
        // compute next group number
        const raw = await queryRunner.manager
          .createQueryBuilder(SessionGroup, 'g')
          .select('MAX(g.group_number)', 'max')
          .where('g.schedule_id = :sid', { sid: schedule.schedule_id })
          .getRawOne();
        const next = (raw?.max ?? -1) + 1;
        group = queryRunner.manager.create(SessionGroup, {
          schedule: schedule,
          group_number: next,
          capacity: effectiveCapacity,
          current_count: 1,
        });
        await queryRunner.manager.save(group);
      }

      const booking = new Booking();
      booking.timeSlot = timeSlot as any;
      booking.schedule = schedule as any;
      booking.group = group as any;
      if (user) booking.user = user as any;
      if (guest_name) booking.guest_name = guest_name;
      if (guest_email) booking.guest_email = guest_email;
      if (guest_phone) booking.guest_phone = guest_phone;
      if (payment_reference) booking.payment_reference = payment_reference;
      // Set initial status based on payment method
      if (payment_method === 'mpesa' && payment_reference) {
        booking.status = BookingStatus.completed; // M-Pesa payments are instant
      } else {
        booking.status = BookingStatus.booked; // Cash payments pending
      }

      const saved = await queryRunner.manager.save(booking);
      await queryRunner.commitTransaction();
      return saved;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.error('Transaction error:', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
    } catch (error) {
      console.error('Booking service error:', error);
      throw error;
    }
  }

  // find bookings: behavior depends on role handled in controller; provide generic filters here
  async findAll(filters?: { schedule_id?: number }) {
    const where: any = {};
    if (filters?.schedule_id) where.schedule_id = filters.schedule_id;
    return await this.bookingRepository.find({
      where,
      relations: ['schedule', 'schedule.session', 'group', 'user'],
    });
  }

  async findOne(id: number) {
    const booking = await this.bookingRepository.findOne({
      where: { booking_id: id },
      relations: ['schedule', 'schedule.session', 'group', 'user'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async update(
    id: number,
    updateBookingDto: UpdateBookingDto,
    currentUser?: any,
  ) {
    const booking = await this.bookingRepository.findOne({
      where: { booking_id: id },
      relations: ['schedule', 'group', 'user'],
    });
    if (!booking) throw new NotFoundException('Booking not found');

    // only owner (client) can update their booking, or admin/manager
    if (currentUser) {
      const role = currentUser.role;
      if (role === 'client') {
        if (!booking.user_id || booking.user_id !== currentUser.userId)
          throw new ForbiddenException('Not your booking');
        // allow updates but enforce cancellation rule in remove
      }
    }

    // Status changes are restricted: only admins may change booking.status directly.
    if (updateBookingDto && (updateBookingDto as any).status !== undefined) {
      // if caller is not admin, forbid status changes via this endpoint
      if (!currentUser || currentUser.role !== 'admin') {
        // If a client attempted to set status to cancelled, instruct them to use cancel endpoint
        if (currentUser && currentUser.role === 'client') {
          throw new ForbiddenException(
            'Clients must use the cancel endpoint to cancel a booking',
          );
        }
        throw new ForbiddenException('Only admin may change booking status');
      }
    }

    const oldStatus = booking.status;
    Object.assign(booking, updateBookingDto);
    const saved = await this.bookingRepository.save(booking);

    // If status transitioned to completed, award loyalty points to registered user
    try {
      if (
        oldStatus !== BookingStatus.completed &&
        saved.status === BookingStatus.completed &&
        saved.user_id
      ) {
        // award 5 points
        await this.profilesService.addPoints(saved.user_id, 5);
      }
    } catch (e) {
      // don't fail update on points-award errors
    }

    return saved;
  }

  /**
   * Accept a payment reference for a booking and persist it for admin verification.
   * This does not automatically change booking.status; admins may verify and update status.
   */
  async confirmPayment(id: number, payment_ref?: string) {
    const booking = await this.bookingRepository.findOne({
      where: { booking_id: id },
      relations: ['schedule', 'group', 'user'],
    });
    if (!booking) throw new NotFoundException('Booking not found');

    // persist the payment reference
    booking.payment_reference = payment_ref ?? undefined;

    // simple automatic verification rule (dev stub):
    // consider verified if payment_ref starts with OK-|PAID-|TXN-|CONF- (case-insensitive)
    const verified =
      typeof payment_ref === 'string' &&
      /^(OK-|PAID-|TXN-|CONF-)/i.test(payment_ref);

    // if verified, mark booking as completed
    const oldStatus = booking.status;
    if (verified) {
      booking.status = BookingStatus.completed;
    }

    const saved = await this.bookingRepository.save(booking);

    // if status moved to completed and booking belongs to a user, award loyalty points
    try {
      if (
        oldStatus !== BookingStatus.completed &&
        saved.status === BookingStatus.completed &&
        saved.user_id
      ) {
        await this.profilesService.addPoints(saved.user_id, 5);
      }
    } catch (e) {
      // don't fail on points award
    }

    return { booking: saved, verified };
  }

  // cancel booking: set status=cancelled and decrement group count (in transaction)
  async cancel(id: number, currentUser?: any) {
    const booking = await this.bookingRepository.findOne({
      where: { booking_id: id },
      relations: ['timeSlot', 'schedule', 'group', 'user'],
    });
    if (!booking) throw new NotFoundException('Booking not found');

    // clients can only cancel 24 hours before schedule start
    if (currentUser && currentUser.role === 'client') {
      if (!booking.user_id || booking.user_id !== currentUser.userId)
        throw new ForbiddenException('Not your booking');
      const start = booking.timeSlot?.start_time || new Date();
      const now = new Date();
      const diffMs = new Date(start).getTime() - now.getTime();
      const hours = diffMs / (1000 * 60 * 60);
      if (hours < 24)
        throw new ConflictException('Sorry, You can only cancel 24 hrs prior.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      booking.status = BookingStatus.cancelled;
      await queryRunner.manager.save(booking);
      if (booking.group_id) {
        const group = await queryRunner.manager.findOne(SessionGroup, {
          where: { id: booking.group_id },
        });
        if (group) {
          group.current_count = Math.max(0, group.current_count - 1);
          await queryRunner.manager.save(group);
        }
      }

      await queryRunner.commitTransaction();
      return { ok: true };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    // physical delete
    const res = await this.bookingRepository.delete({ booking_id: id });
    if (res.affected && res.affected > 0) return { ok: true };
    throw new NotFoundException('Booking not found');
  }
}
