import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Booking } from '../../bookings/entities/booking.entity';

export enum NotificationType {
  NEW_BOOKING = 'new_booking',
  BOOKING_CANCELLED = 'booking_cancelled',
  PAYMENT_RECEIVED = 'payment_received',
  SESSION_COMPLETED = 'session_completed',
  LOYALTY_POINTS_EARNED = 'loyalty_points_earned',
  NEW_SESSION_ADDED = 'new_session_added',
  NEW_USER_REGISTERED = 'new_user_registered',
  NEW_EXPENSE_ADDED = 'new_expense_added',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn({ type: 'int' })
  @ApiProperty({ description: 'Notification ID', example: 1 })
  notification_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'User receiving the notification' })
  user: User;

  @Column({ type: 'int' })
  user_id: number;

  @Column({ type: 'enum', enum: NotificationType })
  @ApiProperty({ description: 'Type of notification', enum: NotificationType })
  type: NotificationType;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'Notification title', example: 'New Booking Received' })
  title: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'Notification message', example: 'You have a new booking from John Doe' })
  message: string;

  @ManyToOne(() => Booking, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  @ApiProperty({ description: 'Related booking (if applicable)', required: false })
  booking?: Booking;

  @Column({ type: 'int', nullable: true })
  booking_id?: number;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Whether notification has been read', example: false })
  is_read: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'When notification was created' })
  created_at: Date;
}