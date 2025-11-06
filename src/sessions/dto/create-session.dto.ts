import { ApiProperty } from '@nestjs/swagger';
import { category } from '../entities/session.entity';
import { IsNumber, IsString, IsEnum, IsOptional } from 'class-validator';

export class CreateSessionDto {
  @ApiProperty({ description: 'Category of the session', example: 'yoga' })
  @IsEnum(category)
  category: category;

  @ApiProperty({
    description: 'Description of the session',
    example: 'A relaxing morning yoga session to start your day.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Duration of the session in minutes',
    example: 60,
  })
  @IsNumber()
  duration_minutes: number;

  @ApiProperty({ description: 'Maximum capacity of the session', example: 20 })
  @IsNumber()
  capacity: number;

  @ApiProperty({ description: 'Price of the session', example: 15.0 })
  @IsNumber()
  price: number;

  // optional trainer association when creating a session
  @ApiProperty({
    description: 'Associated trainer ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  trainer_id?: number;

  @ApiProperty({
    description: 'ID of the user who created the session',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  created_by?: number;
}
