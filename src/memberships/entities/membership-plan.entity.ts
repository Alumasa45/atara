import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('membership_plans')
export class MembershipPlan {
  @PrimaryGeneratedColumn({ type: 'int' })
  @ApiProperty({ description: 'Membership plan ID', example: 1 })
  plan_id: number;

  @Column({ type: 'varchar', length: 50 })
  @ApiProperty({ description: 'Plan name/tier', example: 'Flow Starter' })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({
    description: 'Creative plan description',
    example: 'Perfect for your wellness journey',
  })
  description: string;

  @Column({ type: 'int' })
  @ApiProperty({
    description: 'Number of classes included',
    example: 4,
  })
  classes_included: number;

  @Column({ type: 'int' })
  @ApiProperty({
    description: 'Duration in days (e.g., 30 for 1 month)',
    example: 30,
  })
  duration_days: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @ApiProperty({ description: 'Price in KES', example: 3500.0 })
  price: number;

  @Column({ type: 'text', nullable: true })
  @ApiProperty({
    description: 'JSON array of benefits',
    example: '["4 classes/month", "Email support", "Flexible scheduling"]',
  })
  benefits: string; // Store as JSON string for simplicity

  @Column({ type: 'boolean', default: true })
  @ApiProperty({ description: 'Is plan active', example: true })
  is_active: boolean;

  @Column({ type: 'int', default: 1 })
  @ApiProperty({
    description: 'Sort order for display',
    example: 1,
  })
  sort_order: number;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at', example: '2025-01-01T00:00:00Z' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at', example: '2025-01-01T00:00:00Z' })
  updated_at: Date;
}
