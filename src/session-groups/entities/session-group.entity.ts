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
import { Schedule } from '../../schedule/entities/schedule.entity';

@Entity('session_groups')
export class SessionGroup {
  @PrimaryGeneratedColumn({ type: 'int' })
  @ApiProperty({ description: 'Session group id', example: 1 })
  id: number;

  @ManyToOne(() => Schedule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schedule_id' })
  @ApiProperty({ description: 'Schedule this group belongs to' })
  schedule: Schedule;

  @RelationId((g: SessionGroup) => g.schedule)
  schedule_id: number;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({ description: 'Group number (0 = A, 1 = B)', example: 0 })
  group_number: number;

  @Column({ type: 'int' })
  @ApiProperty({ description: 'Capacity of this group', example: 10 })
  capacity: number;

  @Column({ type: 'int', default: 0 })
  @ApiProperty({
    description: 'Current number of bookings in group',
    example: 0,
  })
  current_count: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
