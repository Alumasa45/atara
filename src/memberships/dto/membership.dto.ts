import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
} from 'class-validator';

export class CreateMembershipPlanDto {
  @ApiProperty({ description: 'Plan name', example: 'Flow Starter' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Plan description',
    example: 'Perfect for beginners',
  })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Classes included', example: 4 })
  @IsNumber()
  classes_included: number;

  @ApiProperty({ description: 'Duration in days', example: 30 })
  @IsNumber()
  duration_days: number;

  @ApiProperty({ description: 'Price in KES', example: 3500 })
  @IsNumber()
  price: number;

  @ApiProperty({
    description: 'Benefits array',
    example: ['4 classes/month', 'Email support'],
  })
  @IsArray()
  benefits: string[];

  @ApiProperty({ description: 'Sort order', example: 1 })
  @IsOptional()
  @IsNumber()
  sort_order?: number;
}

export class UpdateMembershipPlanDto {
  @ApiProperty({ description: 'Plan name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Plan description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Classes included', required: false })
  @IsOptional()
  @IsNumber()
  classes_included?: number;

  @ApiProperty({ description: 'Duration in days', required: false })
  @IsOptional()
  @IsNumber()
  duration_days?: number;

  @ApiProperty({ description: 'Price in KES', required: false })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({
    description: 'Benefits array',
    required: false,
  })
  @IsOptional()
  @IsArray()
  benefits?: string[];

  @ApiProperty({ description: 'Is active', required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ description: 'Sort order', required: false })
  @IsOptional()
  @IsNumber()
  sort_order?: number;
}

export class PurchaseMembershipDto {
  @ApiProperty({ description: 'Plan ID to purchase', example: 1 })
  @IsNumber()
  plan_id: number;

  @ApiProperty({
    description: 'Payment reference (M-Pesa, etc)',
    example: 'TXN123456',
  })
  @IsOptional()
  @IsString()
  payment_reference?: string;
}
