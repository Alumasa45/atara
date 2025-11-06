import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum ManagerRole {
  CENTER_MANAGER = 'center_manager',
  REGIONAL_MANAGER = 'regional_manager',
  OPERATIONS_HEAD = 'operations_head',
}

export enum ManagerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ON_LEAVE = 'on_leave',
}

@Entity('managers')
export class Manager {
  @ApiProperty({ description: 'Manager ID', example: 1 })
  @PrimaryGeneratedColumn({ type: 'int' })
  manager_id: number;

  @ApiProperty({ description: 'User ID (foreign key)', example: 1 })
  @Column({ type: 'int', unique: true })
  user_id: number;

  @ApiProperty({
    description: 'Center or Branch ID',
    example: 1,
  })
  @Column({ type: 'int', nullable: true })
  center_id: number;

  @ApiProperty({
    description: 'Manager role',
    example: 'center_manager',
  })
  @Column({
    type: 'enum',
    enum: ManagerRole,
    default: ManagerRole.CENTER_MANAGER,
  })
  manager_role: ManagerRole;

  @ApiProperty({
    description: 'Manager status',
    example: 'active',
  })
  @Column({
    type: 'enum',
    enum: ManagerStatus,
    default: ManagerStatus.ACTIVE,
  })
  manager_status: ManagerStatus;

  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  @Column({ type: 'varchar', length: 15, nullable: true })
  phone: string;

  @ApiProperty({
    description: 'Department/Center name',
    example: 'Main Branch',
  })
  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @ApiProperty({
    description: 'Bio or description',
    example: 'Experienced center manager with 5+ years',
  })
  @Column({ type: 'text', nullable: true })
  bio: string;

  @ApiProperty({
    description: 'Number of trainers managed',
    example: 10,
  })
  @Column({ type: 'int', default: 0 })
  trainers_count: number;

  @ApiProperty({
    description: 'Number of sessions managed',
    example: 50,
  })
  @Column({ type: 'int', default: 0 })
  sessions_count: number;

  @ApiProperty({
    description: 'Last action timestamp',
    example: '2025-11-04T10:30:00Z',
  })
  @Column({ type: 'timestamp', nullable: true })
  last_action: Date;

  @ApiProperty({
    description: 'Notes about the manager',
    example: 'Managing central branch',
  })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relations
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
