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
  ForbiddenException,
} from '@nestjs/common';
import { TrainersService } from './trainers.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('trainers')
export class TrainersController {
  constructor(private readonly trainersService: TrainersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'manager')
  async create(@Body() createTrainerDto: CreateTrainerDto) {
    return await this.trainersService.create(createTrainerDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 20;
    return await this.trainersService.findAll({ page: p, limit: l });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.trainersService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateTrainerDto: UpdateTrainerDto,
    @Req() req: any,
  ) {
    const currentUser = req.user;
    // admins and managers can update any trainer
    if (
      currentUser &&
      (currentUser.role === 'admin' || currentUser.role === 'manager')
    ) {
      return await this.trainersService.update(+id, updateTrainerDto);
    }

    // trainers can update their own trainer profile
    if (currentUser && currentUser.role === 'trainer') {
      const trainer = await this.trainersService.findOne(+id);
      const ownerUserId = trainer.user?.user_id ?? trainer.user_id;
      if (
        ownerUserId === currentUser.userId ||
        ownerUserId === currentUser.user_id
      ) {
        return await this.trainersService.update(+id, updateTrainerDto);
      }
    }

    throw new ForbiddenException('Not allowed to update this trainer');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('manager')
  async remove(@Param('id') id: string) {
    return await this.trainersService.remove(+id);
  }
}
