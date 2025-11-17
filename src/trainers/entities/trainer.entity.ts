import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum specialty {
  yoga = 'yoga',
  pilates = 'pilates',
  strength_training = 'strength_training',
  dance = 'dance',
  cardio = 'cardio',
  stretching = 'stretching',
  aerobics = 'aerobics',
}

export enum status {
  active = 'active',
  inactive = 'inactive',
}

@Entity('trainers')
export class Trainer {
  @PrimaryGeneratedColumn({ type: 'int' })
  @ApiProperty({ description: 'Trainer ID', example: 1 })
  trainer_id: number;

  @ManyToOne(() => User, (user) => user.trainers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'Associated user (relation)' })
  user: User;

  @RelationId((trainer: Trainer) => trainer.user)
  @ApiProperty({ description: 'Associated User ID', example: 1 })
  user_id: number;

  @ApiProperty({ description: 'Full name of the trainer', example: 'Jane Doe' })
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @ApiProperty({ description: 'Specialty of the trainer', example: 'yoga' })
  @Column({ type: 'enum', enum: specialty })
  specialty: specialty;

  @ApiProperty({
    description: 'Phone number of the trainer',
    example: '+1234567890',
  })
  @Column({ type: 'varchar', length: 15, nullable: true })
  phone: string;

  @ApiProperty({
    description: 'Email address of the trainer',
    example: 'trainer@gmail.com',
  })
  @Column({ type: 'varchar', length: 100 })
  email: string;

  @ApiProperty({
    description: 'Short bio of the trainer',
    example: 'Experienced yoga instructor with 10 years of teaching.',
  })
  @Column({ type: 'text', nullable: true })
  bio: string;

  @ApiProperty({ description: 'Account status', example: 'active' })
  @Column({ type: 'enum', enum: status, default: status.active })
  status: status;

  @ApiProperty({
    description: 'Profile image URL',
    example: '/images/trainers/trainer-123.jpg',
    required: false,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  profile_image?: string;


}
