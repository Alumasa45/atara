import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class TimeSlotDto {
  @ApiProperty({ example: 1, description: 'Session ID for this time slot' })
  @IsInt()
  session_id: number;

  @ApiProperty({ example: '2025-11-10T10:00:00.000Z' })
  @IsISO8601()
  start_time: string;

  @ApiProperty({ example: '2025-11-10T11:00:00.000Z' })
  @IsISO8601()
  end_time: string;
}

export class CreateScheduleDto {
  @ApiProperty({
    description: 'Date for the schedule (YYYY-MM-DD)',
    example: '2025-11-10',
  })
  @IsISO8601({ strict: true, strictSeparator: true })
  date: string;

  @ApiProperty({
    description: 'Array of time slots for this schedule',
    type: [TimeSlotDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  timeSlots: TimeSlotDto[];
}
