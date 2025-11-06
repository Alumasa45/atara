import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
  CreateDateColumn,
} from 'typeorm';

export enum status {
  booked = 'booked',
  cancelled = 'cancelled',
  completed = 'completed',
  missed = 'missed',
}

import { Schedule } from '../../schedule/entities/schedule.entity';
import { ScheduleTimeSlot } from '../../schedule/entities/schedule-time-slot.entity';
import { User } from '../../users/entities/user.entity';
import { SessionGroup } from '../../session-groups/entities/session-group.entity';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn({ type: 'int' })
  @ApiProperty({ description: 'Booking ID', example: 1 })
  booking_id: number;

  // optional user for registered clients; guests allowed (nullable)
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({
    description: 'User who made the booking (nullable for guests)',
    required: false,
  })
  user?: User;

  @RelationId((b: Booking) => b.user)
  user_id?: number;

  // time slot relation (NEW - specific time slot being booked)
  @ManyToOne(() => ScheduleTimeSlot, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'time_slot_id' })
  @ApiProperty({ description: 'Time slot being booked' })
  timeSlot: ScheduleTimeSlot;

  @RelationId((b: Booking) => b.timeSlot)
  time_slot_id: number;

  // schedule relation (kept for backward compatibility, denormalized for easy access)
  @ManyToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schedule_id' })
  @ApiProperty({ description: 'Schedule for this booking' })
  schedule: Schedule;

  @RelationId((b: Booking) => b.schedule)
  schedule_id: number;

  // assigned group (nullable until assigned)
  @ManyToOne(() => SessionGroup, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'group_id' })
  @ApiProperty({ description: 'Session group assignment', required: false })
  group?: SessionGroup;

  @RelationId((b: Booking) => b.group)
  group_id?: number;

  @ApiProperty({
    description: 'Guest name for the booking',
    example: 'John Doe',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  guest_name?: string;

  @ApiProperty({
    description: 'Guest email for the booking',
    example: 'guest@gmail.com',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  guest_email?: string;

  @ApiProperty({
    description: 'Guest phone number for the booking',
    example: '+1234567890',
    required: false,
  })
  @Column({ type: 'varchar', length: 15, nullable: true })
  guest_phone?: string;

  @ApiProperty({
    description: 'Payment reference submitted by the guest for verification',
    example: 'PAY-123456',
    required: false,
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  payment_reference?: string;

  @ApiProperty({
    description: 'Date when the booking was made',
    example: '2024-10-01T10:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamp' })
  date_booked: Date;

  @ApiProperty({ description: 'Status of the booking', example: 'booked' })
  @Column({ type: 'enum', enum: status, default: status.booked })
  status: status;
}
