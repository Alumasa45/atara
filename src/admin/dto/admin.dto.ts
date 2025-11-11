import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

// Import existing enums from User entity
export enum role {
  client = 'client',
  trainer = 'trainer',
  admin = 'admin',
  manager = 'manager',
}

export enum status {
  active = 'active',
  inactive = 'inactive',
  banned = 'banned',
}

export class UpdateUserRoleDto {
  @IsEnum(role)
  role: role;

  @IsEnum(status)
  status: status;
}

export class UpdateTrainerStatusDto {
  @IsEnum(['active', 'inactive', 'pending'])
  status: string;
}

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class AdminQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  filter?: string;
}

// Schedule DTOs
export enum ScheduleRoom {
  matArea = 'matArea',
  reformerStudio = 'reformerStudio',
}

export class CreateTimeSlotDto {
  @Type(() => Number)
  @IsNumber()
  session_id: number;

  @IsString()
  start_time: string; // HH:MM:SS format

  @IsString()
  end_time: string; // HH:MM:SS format
}

export class CreateScheduleDto {
  @IsString()
  date: string; // YYYY-MM-DD format

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTimeSlotDto)
  timeSlots: CreateTimeSlotDto[];
}

export class UpdateTimeSlotDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  session_id?: number;

  @IsOptional()
  @IsString()
  start_time?: string; // HH:MM:SS format

  @IsOptional()
  @IsString()
  end_time?: string; // HH:MM:SS format
}

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  date?: string; // YYYY-MM-DD format

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateTimeSlotDto)
  timeSlots?: UpdateTimeSlotDto[];
}

// Booking DTOs
import { status as BookingStatus } from '../../bookings/entities/booking.entity';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsOptional()
  @IsString()
  payment_reference?: string;
}
