import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Booking } from '../../bookings/entities/booking.entity';
import { User } from '../../users/entities/user.entity';

export enum CancellationRequestStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected',
}

@Entity('cancellation_requests')
export class CancellationRequest {
  @PrimaryGeneratedColumn({ type: 'int' })
  @ApiProperty({ description: 'Request id', example: 1 })
  id: number;

  @ManyToOne(() => Booking, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @RelationId((r: CancellationRequest) => r.booking)
  booking_id: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'requester_id' })
  requester?: User;

  @RelationId((r: CancellationRequest) => r.requester)
  requester_id?: number;

  @Column({ type: 'text', nullable: true })
  message?: string;

  @Column({
    type: 'enum',
    enum: CancellationRequestStatus,
    default: CancellationRequestStatus.pending,
  })
  status: CancellationRequestStatus;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'approver_id' })
  approver?: User;

  @RelationId((r: CancellationRequest) => r.approver)
  approver_id?: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
