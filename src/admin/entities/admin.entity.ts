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

export enum AdminPermissionLevel {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
}

@Entity('admins')
export class Admin {
  @ApiProperty({ description: 'Admin ID', example: 1 })
  @PrimaryGeneratedColumn({ type: 'int' })
  admin_id: number;

  @ApiProperty({ description: 'User ID (foreign key)', example: 1 })
  @Column({ type: 'int', unique: true })
  user_id: number;

  @ApiProperty({ description: 'Permission level', example: 'admin' })
  @Column({
    type: 'enum',
    enum: AdminPermissionLevel,
    default: AdminPermissionLevel.ADMIN,
  })
  permission_level: AdminPermissionLevel;

  @ApiProperty({ description: 'Department', example: 'Management' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  department: string;

  @ApiProperty({ description: 'Is active', example: true })
  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @ApiProperty({
    description: 'Notes about admin',
    example: 'Platform administrator',
  })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ description: 'Last login date' })
  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @ApiProperty({ description: 'Actions performed count', example: 0 })
  @Column({ type: 'int', default: 0 })
  actions_count: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  // Relations
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
