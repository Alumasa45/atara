import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  async create(@Body() createScheduleDto: CreateScheduleDto, @Req() req: any) {
    return await this.scheduleService.create(
      createScheduleDto,
      req.user?.user_id,
    );
  }

  @Get()
  // public: clients and trainers can view schedules
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('date') date?: string,
  ) {
    if (date) {
      return await this.scheduleService.findByDate(date);
    }
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 20;
    return await this.scheduleService.findAll({ page: p, limit: l });
  }

  @Get(':id')
  // public: clients and trainers can view a single schedule
  async findOne(@Param('id') id: string) {
    return await this.scheduleService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Req() req: any,
  ) {
    return await this.scheduleService.update(+id, updateScheduleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  async remove(@Param('id') id: string) {
    return await this.scheduleService.remove(+id);
  }
}
