import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('mpesa_transactions')
export class MpesaTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  checkout_request_id: string;

  @Column()
  merchant_request_id: string;

  @Column()
  phone_number: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  account_reference: string;

  @Column()
  transaction_desc: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  mpesa_receipt_number: string;

  @Column({ nullable: true })
  result_code: string;

  @Column({ nullable: true })
  result_desc: string;

  @CreateDateColumn()
  created_at: Date;
}