import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  RelationId,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ScheduleTimeSlot } from './schedule-time-slot.entity';
import { User } from '../../users/entities/user.entity';

export enum ScheduleStatus {
  active = 'active',
  cancelled = 'cancelled',
}

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn({ type: 'int' })
  @ApiProperty({ example: 1 })
  schedule_id: number;

  @Column({ type: 'date' })
  @ApiProperty({ description: 'Date for this schedule' })
  date: Date;

  @OneToMany(() => ScheduleTimeSlot, (slot) => slot.schedule, {
    cascade: true,
    eager: true,
  })
  @ApiProperty({ description: 'Time slots for this schedule' })
  timeSlots: ScheduleTimeSlot[];

  @Column({
    type: 'enum',
    enum: ScheduleStatus,
    default: ScheduleStatus.active,
  })
  status: ScheduleStatus;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @RelationId((s: Schedule) => s.createdBy)
  created_by?: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
