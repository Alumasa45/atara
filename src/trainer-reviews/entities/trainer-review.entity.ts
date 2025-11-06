import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Trainer } from '../../trainers/entities/trainer.entity';
import { User } from '../../users/entities/user.entity';

@Entity('trainer_reviews')
export class TrainerReview {
  @PrimaryGeneratedColumn({ type: 'int' })
  @ApiProperty({ description: 'Review ID', example: 1 })
  review_id: number;

  @ManyToOne(() => Trainer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainer_id' })
  @ApiProperty({ description: 'The trainer being reviewed' })
  trainer: Trainer;

  @RelationId((review: TrainerReview) => review.trainer)
  @ApiProperty({ description: 'Trainer ID', example: 1 })
  trainer_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'The client who reviewed' })
  user: User;

  @RelationId((review: TrainerReview) => review.user)
  @ApiProperty({ description: 'User ID of the reviewer', example: 1 })
  user_id: number;

  @Column({ type: 'int', default: 5 })
  @ApiProperty({
    description: 'Star rating (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  rating: number;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    description: 'Review text/feedback',
    example: 'Great trainer! Very knowledgeable and motivating.',
    required: false,
  })
  review_text?: string;

  @CreateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'When the review was created' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  @ApiProperty({ description: 'When the review was last updated' })
  updated_at: Date;
}
