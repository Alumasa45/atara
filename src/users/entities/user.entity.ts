import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Trainer } from '../../trainers/entities/trainer.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum role {
  client = 'client',
  trainer = 'trainer',
  admin = 'admin',
  manager = 'manager',
}

export enum status {
  active = 'active',
  inactive = 'inactive',
  banned = 'banned',
}

@Entity('users')
export class User {
  @ApiProperty({ description: 'User ID', example: 1 })
  @PrimaryGeneratedColumn({ type: 'int' })
  user_id: number;

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @ApiProperty({ description: 'Email address', example: 'example@gmail.com' })
  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  @Column({ type: 'varchar', length: 15, unique: true, nullable: true })
  phone: string;

  @ApiProperty({ description: 'Google ID', example: 'google-1234567890' })
  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  google_id: string;

  @ApiProperty({ description: 'Password', example: 'strongpassword123' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string;

  @ApiProperty({ description: 'Email verified flag', example: false })
  @Column({ type: 'boolean', default: false })
  email_verified: boolean;

  @ApiProperty({ description: 'User role', example: 'client' })
  @Column({ type: 'enum', enum: role, default: role.client })
  role: role;

  @ApiProperty({ description: 'Account status', example: 'active' })
  @Column({ type: 'enum', enum: status, default: status.active })
  status: status;

  @ApiProperty({
    description: 'Account creation date',
    example: '2023-10-01T12:00:00Z',
  })
  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @ApiProperty({
    description: 'Last update date',
    example: '2023-10-10T15:30:00Z',
  })
  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @ApiProperty({ description: 'Hashed refresh token (nullable)' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  hashed_refresh_token: string;

  @ApiProperty({
    description: 'Loyalty points balance',
    example: 5,
    default: 0,
  })
  @Column({ type: 'int', default: 0 })
  loyalty_points: number;

  @OneToMany(() => Trainer, (trainer) => trainer.user)
  trainers?: Trainer[];
}
