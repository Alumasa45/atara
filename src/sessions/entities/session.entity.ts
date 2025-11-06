import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { Trainer } from '../../trainers/entities/trainer.entity';
import { User } from '../../users/entities/user.entity';

export enum category {
  yoga = 'yoga',
  pilates = 'pilates',
  strength_training = 'strength_training',
}

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn({ type: 'int' })
  @ApiProperty({ description: 'Session ID', example: 1 })
  session_id: number;

  // relation to Trainer entity. We expose trainer_id via RelationId for queries that only need the id.
  @ManyToOne(() => Trainer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainer_id' })
  @ApiProperty({ description: 'Associated trainer (relation)' })
  trainer?: Trainer;

  @RelationId((session: Session) => session.trainer)
  @ApiProperty({ description: 'Associated trainer ID', example: 1 })
  trainer_id?: number;

  @Column({ type: 'enum', enum: category })
  @ApiProperty({ description: 'Session category', example: 'yoga' })
  category: category;

  @Column({ type: 'varchar', length: 100 })
  @ApiProperty({
    description: 'Session description',
    example: 'Morning Yoga Flow',
  })
  description: string;

  @Column({ type: 'int' })
  @ApiProperty({ description: 'Duration in minutes', example: 60 })
  duration_minutes: number;

  @Column({ type: 'int' })
  @ApiProperty({ description: 'Maximum capacity', example: 15 })
  capacity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ description: 'Session price', example: 20.0 })
  price: number;

  // who created the session (optional)
  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by' })
  @ApiProperty({
    description: 'User who created the session (relation)',
    required: false,
  })
  createdBy?: User;

  @RelationId((session: Session) => session.createdBy)
  @ApiProperty({ description: 'Creator user id', example: 1, required: false })
  created_by?: number;
}
