import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsPositive,
} from 'class-validator';
import { ManagerRole, ManagerStatus } from '../entities/manager.entity';

export class CreateManagerDto {
  @IsInt()
  @IsPositive()
  user_id: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  center_id?: number;

  @IsEnum(ManagerRole)
  manager_role: ManagerRole;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateManagerDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  center_id?: number;

  @IsOptional()
  @IsEnum(ManagerRole)
  manager_role?: ManagerRole;

  @IsOptional()
  @IsEnum(ManagerStatus)
  manager_status?: ManagerStatus;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ManagerQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(ManagerRole)
  manager_role?: ManagerRole;

  @IsOptional()
  @IsEnum(ManagerStatus)
  manager_status?: ManagerStatus;

  @IsOptional()
  @IsInt()
  @IsPositive()
  center_id?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @IsPositive()
  limit?: number = 10;
}
