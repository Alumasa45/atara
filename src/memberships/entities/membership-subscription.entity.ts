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
import { User } from '../../users/entities/user.entity';
import { MembershipPlan } from './membership-plan.entity';

@Entity('membership_subscriptions')
export class MembershipSubscription {
  @PrimaryGeneratedColumn({ type: 'int' })
  @ApiProperty({ description: 'Subscription ID', example: 1 })
  subscription_id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @ApiProperty({ description: 'User who owns this subscription' })
  user: User;

  @RelationId((sub: MembershipSubscription) => sub.user)
  @ApiProperty({ description: 'User ID', example: 1 })
  user_id: number;

  @ManyToOne(() => MembershipPlan, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_id' })
  @ApiProperty({ description: 'Membership plan' })
  plan: MembershipPlan;

  @RelationId((sub: MembershipSubscription) => sub.plan)
  @ApiProperty({ description: 'Plan ID', example: 1 })
  plan_id: number;

  @Column({ type: 'date' })
  @ApiProperty({
    description: 'Subscription start date',
    example: '2025-01-01',
  })
  start_date: Date;

  @Column({ type: 'date' })
  @ApiProperty({
    description: 'Subscription end date',
    example: '2025-01-31',
  })
  end_date: Date;

  @Column({ type: 'int' })
  @ApiProperty({
    description: 'Number of classes remaining',
    example: 4,
  })
  classes_remaining: number;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  @ApiProperty({
    description: 'Subscription status',
    example: 'active',
  })
  status: 'active' | 'expired' | 'cancelled';

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty({
    description: 'Payment reference/transaction ID',
    nullable: true,
    example: 'TXN123456',
  })
  payment_reference: string;

  @CreateDateColumn()
  @ApiProperty({ description: 'Created at', example: '2025-01-01T00:00:00Z' })
  created_at: Date;

  @UpdateDateColumn()
  @ApiProperty({ description: 'Updated at', example: '2025-01-01T00:00:00Z' })
  updated_at: Date;
}
