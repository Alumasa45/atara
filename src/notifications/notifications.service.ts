import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification, NotificationType } from './entities/notification.entity';
import { User } from '../users/entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { Trainer } from '../trainers/entities/trainer.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Trainer)
    private readonly trainerRepository: Repository<Trainer>,
  ) {}

  /**
   * Create a notification for a trainer when they receive a new booking
   */
  async createBookingNotification(booking: Booking): Promise<void> {
    try {
      // Get trainer from the booking's session
      const trainerId = booking.timeSlot?.session?.trainer?.trainer_id;
      if (!trainerId) return;

      const trainer = await this.trainerRepository.findOne({
        where: { trainer_id: trainerId },
        relations: ['user'],
      });

      if (!trainer?.user) return;

      const clientName = booking.user?.username || booking.guest_name || 'A client';
      const sessionName = booking.timeSlot?.session?.category || 'session';
      const sessionTime = booking.timeSlot?.start_time 
        ? new Date(booking.timeSlot.start_time).toLocaleString()
        : 'scheduled time';

      const notification = new Notification();
      notification.user = trainer.user;
      notification.user_id = trainer.user.user_id;
      notification.type = NotificationType.NEW_BOOKING;
      notification.title = 'New Booking Received';
      notification.message = `${clientName} has booked your ${sessionName} session for ${sessionTime}`;
      notification.booking = booking;
      notification.booking_id = booking.booking_id;
      notification.is_read = false;

      await this.notificationRepository.save(notification);
    } catch (error) {
      console.error('Error creating booking notification:', error);
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: number, limit = 20): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: { user_id: userId },
      relations: ['booking', 'booking.user', 'booking.timeSlot', 'booking.timeSlot.session'],
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: number, userId: number): Promise<void> {
    await this.notificationRepository.update(
      { notification_id: notificationId, user_id: userId },
      { is_read: true }
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { user_id: userId },
      { is_read: true }
    );
  }

  /**
   * Get unread notification count for a user
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: { user_id: userId, is_read: false },
    });
  }

  /**
   * Create notification for admin when new booking is made
   */
  async createAdminBookingNotification(booking: Booking): Promise<void> {
    try {
      const admins = await this.userRepository.find({
        where: { role: 'admin' },
      });

      const clientName = booking.user?.username || booking.guest_name || 'A client';
      const sessionName = booking.timeSlot?.session?.category || 'session';
      const sessionTime = booking.timeSlot?.start_time 
        ? new Date(booking.timeSlot.start_time).toLocaleString()
        : 'scheduled time';

      for (const admin of admins) {
        const notification = new Notification();
        notification.user = admin;
        notification.user_id = admin.user_id;
        notification.type = NotificationType.NEW_BOOKING;
        notification.title = 'New Booking Made';
        notification.message = `${clientName} has made a booking for ${sessionName} at ${sessionTime}`;
        notification.booking = booking;
        notification.booking_id = booking.booking_id;
        notification.is_read = false;

        await this.notificationRepository.save(notification);
      }
    } catch (error) {
      console.error('Error creating admin booking notification:', error);
    }
  }

  /**
   * Create notification for manager when new booking is made
   */
  async createManagerBookingNotification(booking: Booking): Promise<void> {
    try {
      const managers = await this.userRepository.find({
        where: { role: 'manager' },
      });

      const clientName = booking.user?.username || booking.guest_name || 'A client';
      const sessionName = booking.timeSlot?.session?.category || 'session';
      const sessionTime = booking.timeSlot?.start_time 
        ? new Date(booking.timeSlot.start_time).toLocaleString()
        : 'scheduled time';

      for (const manager of managers) {
        const notification = new Notification();
        notification.user = manager;
        notification.user_id = manager.user_id;
        notification.type = NotificationType.NEW_BOOKING;
        notification.title = 'New Booking Made';
        notification.message = `${clientName} has made a booking for ${sessionName} at ${sessionTime}`;
        notification.booking = booking;
        notification.booking_id = booking.booking_id;
        notification.is_read = false;

        await this.notificationRepository.save(notification);
      }
    } catch (error) {
      console.error('Error creating manager booking notification:', error);
    }
  }

  /**
   * Create notification for client when new session is added
   */
  async createNewSessionNotification(session: any): Promise<void> {
    try {
      const clients = await this.userRepository.find({
        where: { role: 'client' },
      });

      const trainerName = session.trainer?.user?.username || 'Trainer';
      const sessionDate = session.date ? new Date(session.date).toLocaleDateString() : 'upcoming date';

      for (const client of clients) {
        const notification = new Notification();
        notification.user = client;
        notification.user_id = client.user_id;
        notification.type = NotificationType.NEW_SESSION_ADDED;
        notification.title = 'New Session Available';
        notification.message = `New ${session.category} session with ${trainerName} available on ${sessionDate}`;
        notification.is_read = false;

        await this.notificationRepository.save(notification);
      }
    } catch (error) {
      console.error('Error creating new session notification:', error);
    }
  }

  /**
   * Create notification for client when session is completed and loyalty points earned
   */
  async createSessionCompletedNotification(booking: Booking, pointsEarned: number): Promise<void> {
    try {
      if (!booking.user) return;

      const sessionName = booking.timeSlot?.session?.category || 'session';
      
      const notification = new Notification();
      notification.user = booking.user;
      notification.user_id = booking.user.user_id;
      notification.type = NotificationType.SESSION_COMPLETED;
      notification.title = 'Session Completed!';
      notification.message = `Your ${sessionName} session has been completed. You earned ${pointsEarned} loyalty points!`;
      notification.booking = booking;
      notification.booking_id = booking.booking_id;
      notification.is_read = false;

      await this.notificationRepository.save(notification);
    } catch (error) {
      console.error('Error creating session completed notification:', error);
    }
  }

  /**
   * Create notification for client when loyalty points are earned
   */
  async createLoyaltyPointsNotification(userId: number, pointsEarned: number, reason: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ where: { user_id: userId } });
      if (!user) return;

      const notification = new Notification();
      notification.user = user;
      notification.user_id = userId;
      notification.type = NotificationType.LOYALTY_POINTS_EARNED;
      notification.title = 'Loyalty Points Earned!';
      notification.message = `You earned ${pointsEarned} loyalty points for ${reason}`;
      notification.is_read = false;

      await this.notificationRepository.save(notification);
    } catch (error) {
      console.error('Error creating loyalty points notification:', error);
    }
  }

  /**
   * Create notification for manager when new user is registered
   */
  async createNewUserNotification(newUser: User): Promise<void> {
    try {
      const managers = await this.userRepository.find({
        where: { role: 'manager' },
      });

      for (const manager of managers) {
        const notification = new Notification();
        notification.user = manager;
        notification.user_id = manager.user_id;
        notification.type = NotificationType.NEW_USER_REGISTERED;
        notification.title = 'New User Registered';
        notification.message = `${newUser.username} (${newUser.email}) has registered as a ${newUser.role}`;
        notification.is_read = false;

        await this.notificationRepository.save(notification);
      }
    } catch (error) {
      console.error('Error creating new user notification:', error);
    }
  }

  /**
   * Create notification for manager when new expense is added
   */
  async createNewExpenseNotification(expense: any): Promise<void> {
    try {
      const managers = await this.userRepository.find({
        where: { role: 'manager' },
      });

      for (const manager of managers) {
        const notification = new Notification();
        notification.user = manager;
        notification.user_id = manager.user_id;
        notification.type = NotificationType.NEW_EXPENSE_ADDED;
        notification.title = 'New Expense Added';
        notification.message = `New expense: ${expense.description} - $${expense.amount}`;
        notification.is_read = false;

        await this.notificationRepository.save(notification);
      }
    } catch (error) {
      console.error('Error creating new expense notification:', error);
    }
  }
}