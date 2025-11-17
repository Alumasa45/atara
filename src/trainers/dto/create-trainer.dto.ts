import { IsEmail, IsString, IsInt, IsNotEmpty, IsEnum } from 'class-validator';
import { specialty, status } from '../entities/trainer.entity';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTrainerDto {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({ description: 'Associated user id', example: 1 })
  user_id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Full name of the trainer', example: 'Jane Doe' })
  name: string;

  @IsNotEmpty()
  @IsEnum(specialty, {
    message:
      'specialty must be one of: yoga, pilates, strength_training, dance',
  })
  @ApiProperty({
    description: 'Specialty of the trainer',
    example: 'yoga',
    enum: ['yoga', 'pilates', 'strength_training', 'dance'],
  })
  specialty: specialty;

  @IsString()
  @ApiProperty({
    description: 'Phone number of the trainer',
    example: '+1234567890',
    required: false,
  })
  phone?: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email address of the trainer',
    example: 'trainer@gmail.com',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'Short bio of the trainer',
    example: 'Experienced yoga instructor with 10 years of teaching.',
    required: false,
  })
  bio?: string;

  @IsNotEmpty()
  @IsEnum(status, { message: 'status must be one of: active, inactive' })
  @ApiProperty({
    description: 'Account status',
    example: 'active',
    enum: ['active', 'inactive'],
  })
  status: status;
}
