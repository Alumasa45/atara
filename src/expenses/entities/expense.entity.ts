import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ExpenseStatus {
  APPROVED = 'approved',
  CANCELLED = 'cancelled',
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn()
  expense_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  cost: number;

  @Column({
    type: 'enum',
    enum: ExpenseStatus,
    default: ExpenseStatus.APPROVED,
  })
  status: ExpenseStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}