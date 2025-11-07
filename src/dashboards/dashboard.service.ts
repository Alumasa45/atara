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
import { Session } from '../sessions/entities/session.entity';
import {
  CancellationRequest,
  CancellationRequestStatus,
} from '../cancellation-requests/entities/cancellation-request.entity';

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
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    @InjectRepository(CancellationRequest)
    private readonly cancellationRepository: Repository<CancellationRequest>,
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
    const totalBookings = await this.bookingRepository.count({
      where: { user_id: userId }
    });
    
    const confirmedBookings = await this.bookingRepository.count({
      where: { user_id: userId, status: BookingStatus.booked }
    });
    
    const cancelledBookings = await this.bookingRepository.count({
      where: { user_id: userId, status: BookingStatus.cancelled }
    });
    
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

      // Get simple schedules
      const upcomingSchedules = await this.scheduleRepository.find({
        take: 10,
        order: { date: 'ASC' }
      });

      console.log('Dashboard service - data collected successfully');

      return {
        profile,
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

    // Get trainer's sessions
    const sessions = await this.sessionRepository.find({
      where: { trainer_id: trainer.trainer_id },
      relations: ['trainer'],
    });

    // Get upcoming schedules for trainer's sessions
    const upcomingSchedules = await this.scheduleRepository
      .createQueryBuilder('s')
      .leftJoinAndSelect('s.sessions', 'ses')
      .leftJoinAndSelect('ses.trainer', 't')
      .where('ses.trainer_id = :trainerId', { trainerId: trainer.trainer_id })
      .andWhere('s.start_time > NOW()')
      .orderBy('s.start_time', 'ASC')
      .take(10)
      .getMany();

    // Get bookings for trainer's schedules
    const bookings = await this.bookingRepository
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.schedule', 's')
      .leftJoinAndSelect('s.sessions', 'ses')
      .leftJoinAndSelect('ses.trainer', 't')
      .leftJoinAndSelect('b.user', 'u')
      .where('ses.trainer_id = :trainerId', { trainerId: trainer.trainer_id })
      .andWhere('b.status != :cancelledStatus', {
        cancelledStatus: BookingStatus.cancelled,
      })
      .orderBy('s.start_time', 'DESC')
      .take(20)
      .getMany();

    // Get cancellation requests - for trainer
    const cancellations = await this.cancellationRepository
      .createQueryBuilder('cr')
      .leftJoinAndSelect('cr.booking', 'b')
      .leftJoinAndSelect('b.schedule', 's')
      .leftJoinAndSelect('s.sessions', 'ses')
      .where('ses.trainer_id = :trainerId', { trainerId: trainer.trainer_id })
      .orderBy('cr.created_at', 'DESC')
      .take(10)
      .getMany();

    // Stats
    const totalSessions = sessions.length;
    const totalBookings = bookings.length;
    const cancelledBookings = await this.bookingRepository
      .createQueryBuilder('b')
      .leftJoin('b.schedule', 's')
      .leftJoin('s.sessions', 'ses')
      .where('ses.trainer_id = :trainerId', { trainerId: trainer.trainer_id })
      .andWhere('b.status = :cancelledStatus', {
        cancelledStatus: BookingStatus.cancelled,
      })
      .getCount();

    return {
      trainer,
      sessions,
      upcomingSchedules,
      bookings,
      cancellations,
      stats: {
        totalSessions,
        totalBookings,
        cancelledBookings,
        upcomingCount: upcomingSchedules.length,
      },
    };
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
}
