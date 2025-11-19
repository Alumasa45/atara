import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, role } from '../users/entities/user.entity';
import {
  Booking,
  status as BookingStatus,
} from '../bookings/entities/booking.entity';
import { Trainer } from '../trainers/entities/trainer.entity';
import { Schedule } from '../schedule/entities/schedule.entity';
import { ScheduleTimeSlot } from '../schedule/entities/schedule-time-slot.entity';
import { Session } from '../sessions/entities/session.entity';
import {
  CancellationRequest,
  CancellationRequestStatus,
} from '../cancellation-requests/entities/cancellation-request.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Trainer)
    private readonly trainerRepository: Repository<Trainer>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(ScheduleTimeSlot)
    private readonly scheduleTimeSlotRepository: Repository<ScheduleTimeSlot>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(CancellationRequest)
    private readonly cancellationRepository: Repository<CancellationRequest>,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Get user profile
   */
  async getUserProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(userId: number) {
    const totalBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.user', 'user')
      .where('user.user_id = :userId', { userId })
      .getCount();
    
    const confirmedBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.user', 'user')
      .where('user.user_id = :userId', { userId })
      .andWhere('booking.status = :status', { status: BookingStatus.booked })
      .getCount();
    
    const cancelledBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.user', 'user')
      .where('user.user_id = :userId', { userId })
      .andWhere('booking.status = :status', { status: BookingStatus.cancelled })
      .getCount();
    
    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      pendingBookings: totalBookings - confirmedBookings - cancelledBookings,
    };
  }

  /**
   * Get upcoming schedules
   */
  async getUpcomingSchedules() {
    return await this.scheduleRepository.find({
      take: 10,
      order: { date: 'ASC' }
    });
  }

  /**
   * Get client dashboard data
   */
  async getClientDashboard(userId: number) {
    try {
      console.log('Dashboard service - userId:', userId);
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
      });
      if (!user) throw new NotFoundException('User not found');
      console.log('Dashboard service - user found:', user.username);

      // Get user profile data
      const profile = user;
      console.log('Dashboard service - getting bookings...');

      // Get basic booking counts
      const totalBookings = await this.bookingRepository.count({
        where: { user_id: userId }
      });
      console.log('Dashboard service - total bookings:', totalBookings);

      const confirmedBookings = await this.bookingRepository.count({
        where: { user_id: userId, status: BookingStatus.booked }
      });

      const cancelledBookings = await this.bookingRepository.count({
        where: { user_id: userId, status: BookingStatus.cancelled }
      });

      // Get simple bookings without complex joins
      const upcomingBookings = await this.bookingRepository.find({
        where: { user_id: userId, status: BookingStatus.booked },
        take: 5,
        order: { booking_id: 'DESC' }
      });

      const pastBookings = await this.bookingRepository.find({
        where: { user_id: userId },
        take: 10,
        order: { booking_id: 'DESC' }
      });

      // Get schedules with trainer information using query builder for better control
      const upcomingSchedules = await this.scheduleRepository
        .createQueryBuilder('schedule')
        .leftJoinAndSelect('schedule.timeSlots', 'timeSlot')
        .leftJoinAndSelect('timeSlot.session', 'session')
        .leftJoinAndSelect('session.trainer', 'trainer')
        .orderBy('schedule.date', 'ASC')
        .take(10)
        .getMany();
      
      console.log('Dashboard service - schedules with trainer data:', JSON.stringify(upcomingSchedules, null, 2));

      console.log('Dashboard service - data collected successfully');

      return {
        profile: {
          ...profile,
          username: user.username,
          email: user.email
        },
        upcomingBookings,
        pastBookings,
        upcomingSchedules,
        stats: {
          totalBookings,
          confirmedBookings,
          cancelledBookings,
          pendingBookings: totalBookings - confirmedBookings - cancelledBookings,
        },
      };
    } catch (error) {
      console.error('Dashboard service error:', error);
      throw error;
    }
  }

  /**
   * Get trainer dashboard data
   */
  async getTrainerDashboard(userId: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
      });
      if (!user) throw new NotFoundException('User not found');

      const trainer = await this.trainerRepository
        .createQueryBuilder('t')
        .leftJoinAndSelect('t.user', 'u')
        .where('t.user_id = :userId', { userId })
        .getOne();
      if (!trainer) throw new NotFoundException('Trainer profile not found');

      // Get trainer's sessions using QueryBuilder (safer approach)
      const sessions = await this.sessionRepository
        .createQueryBuilder('session')
        .leftJoinAndSelect('session.trainer', 'trainer')
        .where('trainer.trainer_id = :trainerId', { trainerId: trainer.trainer_id })
        .getMany();

      // Get student bookings for this trainer's sessions
      const bookings = await this.bookingRepository
        .createQueryBuilder('b')
        .leftJoinAndSelect('b.user', 'u')
        .leftJoinAndSelect('b.timeSlot', 'ts')
        .leftJoinAndSelect('ts.session', 's')
        .leftJoinAndSelect('s.trainer', 't')
        .where('t.trainer_id = :trainerId', { trainerId: trainer.trainer_id })
        .orderBy('b.date_booked', 'DESC')
        .take(20)
        .getMany();

      // Get all schedules (simplified)
      const upcomingSchedules = await this.scheduleRepository.find({
        take: 10,
        order: { date: 'ASC' }
      });

      // Get notifications for trainer
      let notifications: any[] = [];
      let unreadCount = 0;
      try {
        notifications = await this.notificationsService.getUserNotifications(userId, 10);
        unreadCount = await this.notificationsService.getUnreadCount(userId);
      } catch (error) {
        console.log('Notifications not available yet:', error.message);
      }

      // Clean up trainer data to remove N/A values
      const cleanTrainer = {
        ...trainer,
        name: trainer.name === 'N/A' ? 'Trainer' : trainer.name,
        email: trainer.email === 'N/A' ? 'trainer@atara.com' : trainer.email,
        phone: trainer.phone === 'N/A' ? '+254 700 000 000' : trainer.phone,
        bio: trainer.bio === 'N/A' ? 'Professional fitness trainer' : trainer.bio,
        specialty: (trainer.specialty as string) === 'N/A' ? 'strength_training' : trainer.specialty
      };

      // Clean up sessions data
      const cleanSessions = (sessions || []).map(session => ({
        ...session,
        category: (session.category as string) === 'N/A' ? 'strength_training' : session.category,
        description: session.description === 'N/A' ? 'Fitness Training Session' : session.description,
        duration_minutes: session.duration_minutes || 60,
        capacity: session.capacity || 15,
        price: session.price || 25.00
      }));

      // Clean up bookings data
      const cleanBookings = (bookings || []).map(booking => ({
        ...booking,
        guest_name: booking.guest_name === 'N/A' ? 'Client' : booking.guest_name,
        guest_email: booking.guest_email === 'N/A' ? 'client@example.com' : booking.guest_email,
        guest_phone: booking.guest_phone === 'N/A' ? '+254 700 000 000' : booking.guest_phone,
        payment_reference: booking.payment_reference === 'N/A' ? 'Pending Payment' : booking.payment_reference
      }));

      return {
        trainer: cleanTrainer,
        sessions: cleanSessions,
        upcomingSchedules: upcomingSchedules || [],
        bookings: cleanBookings,
        cancellations: [],
        notifications: notifications || [],
        unreadNotifications: unreadCount || 0,
        stats: {
          totalSessions: cleanSessions.length,
          totalBookings: cleanBookings.length,
          cancelledBookings: cleanBookings.filter(b => b.status === BookingStatus.cancelled).length,
          upcomingCount: upcomingSchedules ? upcomingSchedules.length : 0,
        },
      };
    } catch (error) {
      console.error('Trainer dashboard error:', error);
      throw error;
    }
  }

  /**
   * Get manager dashboard data
   */
  async getManagerDashboard() {
    // Total users by role
    const totalClients = await this.userRepository
      .createQueryBuilder('u')
      .where('u.role = :role', { role: role.client })
      .getCount();

    const totalTrainers = await this.userRepository
      .createQueryBuilder('u')
      .where('u.role = :role', { role: role.trainer })
      .getCount();

    const totalUsers = await this.userRepository.count();

    // Booking statistics using QueryBuilder
    const totalBookings = await this.bookingRepository
      .createQueryBuilder('b')
      .getCount();

    const confirmedBookings = await this.bookingRepository
      .createQueryBuilder('b')
      .where('b.status = :status', { status: BookingStatus.booked })
      .getCount();

    const pendingBookings = await this.bookingRepository
      .createQueryBuilder('b')
      .where('b.status = :status', { status: BookingStatus.missed })
      .getCount();

    const cancelledBookings = await this.bookingRepository
      .createQueryBuilder('b')
      .where('b.status = :status', { status: BookingStatus.cancelled })
      .getCount();

    // Session statistics
    const totalSessions = await this.sessionRepository.count();

    // Recent bookings
    const recentBookings = await this.bookingRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.schedule', 's')
      .leftJoinAndSelect('s.session', 'ses')
      .leftJoinAndSelect('ses.trainer', 't')
      .leftJoinAndSelect('b.user', 'u')
      .orderBy('b.created_at', 'DESC')
      .take(15)
      .getMany();

    // Recent cancellation requests
    const recentCancellations = await this.cancellationRepository.find({
      take: 10,
      order: { created_at: 'DESC' },
    });

    return {
      stats: {
        totalUsers,
        totalClients,
        totalTrainers,
        totalBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        totalSessions,
      },
      recentBookings,
      recentCancellations,
    };
  }

  /**
   * Get admin dashboard data (full system overview)
   */
  async getAdminDashboard() {
    // User statistics
    const totalUsers = await this.userRepository.count();
    const usersByRole = {
      clients: await this.userRepository
        .createQueryBuilder('u')
        .where('u.role = :role', { role: role.client })
        .getCount(),
      trainers: await this.userRepository
        .createQueryBuilder('u')
        .where('u.role = :role', { role: role.trainer })
        .getCount(),
      managers: await this.userRepository
        .createQueryBuilder('u')
        .where('u.role = :role', { role: role.manager })
        .getCount(),
      admins: await this.userRepository
        .createQueryBuilder('u')
        .where('u.role = :role', { role: role.admin })
        .getCount(),
    };

    // Booking statistics
    const totalBookings = await this.bookingRepository
      .createQueryBuilder('b')
      .getCount();

    const bookingsByStatus = {
      confirmed: await this.bookingRepository
        .createQueryBuilder('b')
        .where('b.status = :status', { status: BookingStatus.booked })
        .getCount(),
      pending: await this.bookingRepository
        .createQueryBuilder('b')
        .where('b.status = :status', { status: BookingStatus.missed })
        .getCount(),
      cancelled: await this.bookingRepository
        .createQueryBuilder('b')
        .where('b.status = :status', { status: BookingStatus.cancelled })
        .getCount(),
    };

    // Session statistics
    const totalSessions = await this.sessionRepository.count();
    const totalSchedules = await this.scheduleRepository.count();

    // Trainer statistics
    const totalTrainers = await this.trainerRepository.count();

    // Cancellation statistics
    const totalCancellations = await this.cancellationRepository
      .createQueryBuilder('cr')
      .getCount();

    const pendingCancellations = await this.cancellationRepository
      .createQueryBuilder('cr')
      .where('cr.status = :status', {
        status: CancellationRequestStatus.pending,
      })
      .getCount();

    // Recent activities
    const recentBookings = await this.bookingRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.schedule', 's')
      .leftJoinAndSelect('s.session', 'ses')
      .leftJoinAndSelect('ses.trainer', 't')
      .leftJoinAndSelect('b.user', 'u')
      .orderBy('b.created_at', 'DESC')
      .take(20)
      .getMany();

    const recentUsers = await this.userRepository.find({
      order: { created_at: 'DESC' },
      take: 10,
    });

    const pendingCancellationsList = await this.cancellationRepository.find({
      where: { status: CancellationRequestStatus.pending },
      take: 10,
      order: { created_at: 'DESC' },
    });

    return {
      summary: {
        totalUsers,
        totalBookings,
        totalSessions,
        totalSchedules,
        totalTrainers,
        totalCancellations,
      },
      usersByRole,
      bookingsByStatus,
      pendingCancellations,
      recentBookings,
      recentUsers,
      pendingCancellationsList,
    };
  }

  /**
   * Get trainer's sessions (My Sessions)
   */
  async getTrainerSessions(userId: number) {
    const trainer = await this.trainerRepository.findOne({
      where: { user_id: userId },
    });
    if (!trainer) throw new NotFoundException('Trainer profile not found');

    const sessions = await this.sessionRepository.find({
      where: { trainer: { trainer_id: trainer.trainer_id } },
      relations: ['trainer'],
      order: { session_id: 'DESC' },
    });

    // Return sessions with meaningful data instead of N/A
    return sessions.map(session => ({
      ...session,
      category: (session.category as string) === 'N/A' ? 'strength_training' : (session.category || 'strength_training'),
      description: session.description === 'N/A' ? 'Fitness Training Session' : (session.description || 'Fitness Training Session'),
      duration_minutes: session.duration_minutes || 60,
      capacity: session.capacity || 15,
      price: session.price || 25.00,
      trainer_name: (session.trainer?.name === 'N/A' ? 'Trainer' : session.trainer?.name) || (trainer.name === 'N/A' ? 'Trainer' : trainer.name) || 'Trainer'
    }));
  }

  /**
   * Get trainer's student bookings (Student Bookings) with filtering
   */
  async getTrainerBookings(userId: number, filter?: string) {
    const trainer = await this.trainerRepository.findOne({
      where: { user_id: userId },
    });
    if (!trainer) throw new NotFoundException('Trainer profile not found');

    let queryBuilder = this.bookingRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.user', 'u')
      .leftJoinAndSelect('b.timeSlot', 'ts')
      .leftJoinAndSelect('ts.session', 's')
      .leftJoinAndSelect('s.trainer', 't')
      .leftJoinAndSelect('b.schedule', 'sch')
      .where('t.trainer_id = :trainerId', { trainerId: trainer.trainer_id });

    // Apply filters
    if (filter === 'recent') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      queryBuilder = queryBuilder.andWhere('b.date_booked >= :sevenDaysAgo', { sevenDaysAgo });
    } else if (filter === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      queryBuilder = queryBuilder.andWhere('b.date_booked >= :today AND b.date_booked < :tomorrow', { today, tomorrow });
    } else if (filter === 'confirmed') {
      queryBuilder = queryBuilder.andWhere('b.status = :status', { status: BookingStatus.booked });
    } else if (filter === 'cancelled') {
      queryBuilder = queryBuilder.andWhere('b.status = :status', { status: BookingStatus.cancelled });
    }

    const bookings = await queryBuilder
      .orderBy('b.date_booked', 'DESC')
      .getMany();

    // Return bookings with meaningful data and booking date
    return bookings.map(booking => ({
      ...booking,
      client_name: (booking.user?.username === 'N/A' ? 'Client' : booking.user?.username) || (booking.guest_name === 'N/A' ? 'Guest Client' : booking.guest_name) || 'Guest Client',
      client_email: (booking.user?.email === 'N/A' ? 'client@example.com' : booking.user?.email) || (booking.guest_email === 'N/A' ? 'client@example.com' : booking.guest_email) || 'client@example.com',
      client_phone: (booking.user?.phone === 'N/A' ? '+254 700 000 000' : booking.user?.phone) || (booking.guest_phone === 'N/A' ? '+254 700 000 000' : booking.guest_phone) || '+254 700 000 000',
      session_name: (booking.timeSlot?.session?.description === 'N/A' ? 'Fitness Training Session' : booking.timeSlot?.session?.description) || 'Fitness Training Session',
      session_category: (booking.timeSlot?.session?.category as string) === 'N/A' ? 'strength_training' : (booking.timeSlot?.session?.category || 'strength_training'),
      booking_date: booking.date_booked,
      schedule_date: booking.schedule?.date || new Date(),
      payment_ref: (booking.payment_reference === 'N/A' ? 'Pending Payment' : booking.payment_reference) || 'Pending Payment',
      status_display: booking.status || 'booked'
    }));
  }
}
