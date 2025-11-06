import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  RelationId,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Schedule } from './schedule.entity';
import { Session } from '../../sessions/entities/session.entity';

@Entity('schedule_time_slots')
export class ScheduleTimeSlot {
  @PrimaryGeneratedColumn({ type: 'int' })
  @ApiProperty({ example: 1 })
  slot_id: number;

  @ManyToOne(() => Schedule, (schedule) => schedule.timeSlots, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'schedule_id' })
  schedule: Schedule;

  @RelationId((slot: ScheduleTimeSlot) => slot.schedule)
  @Column({ type: 'int' })
  schedule_id: number;

  @ManyToOne(() => Session, { onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @RelationId((slot: ScheduleTimeSlot) => slot.session)
  @Column({ type: 'int' })
  session_id: number;

  @Column({ type: 'time' })
  @ApiProperty({ description: 'Start time for this time slot (HH:MM:SS)' })
  start_time: string;

  @Column({ type: 'time' })
  @ApiProperty({ description: 'End time for this time slot (HH:MM:SS)' })
  end_time: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
