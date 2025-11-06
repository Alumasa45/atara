import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsEmail } from 'class-validator';

export class CreateBookingDto {
  @ApiProperty({
    description: 'User id (optional for registered users)',
    required: false,
  })
  @IsOptional()
  @IsInt()
  user_id?: number;

  @ApiProperty({
    description: 'Time slot id to book (specific session at specific time)',
    example: 1,
  })
  @IsInt()
  time_slot_id: number;

  @ApiProperty({
    description:
      'Schedule id (for backward compatibility, derived from time slot)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  schedule_id?: number;

  @ApiProperty({
    description: 'Guest name (if not registered)',
    required: false,
  })
  @IsOptional()
  @IsString()
  guest_name?: string;

  @ApiProperty({
    description: 'Guest email (if not registered)',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  guest_email?: string;

  @ApiProperty({
    description: 'Guest phone (if not registered)',
    required: false,
  })
  @IsOptional()
  @IsString()
  guest_phone?: string;
}
