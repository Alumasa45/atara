import { IsString, IsDateString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ExpenseStatus } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsString()
  name: string;

  @IsDateString()
  date: string;

  @IsNumber()
  cost: number;

  @IsEnum(ExpenseStatus)
  @IsOptional()
  status?: ExpenseStatus;
}

export class UpdateExpenseStatusDto {
  @IsEnum(ExpenseStatus)
  status: ExpenseStatus;
}