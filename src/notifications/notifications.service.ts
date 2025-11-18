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
}