import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ManagerService } from './manager.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {
  CreateManagerDto,
  UpdateManagerDto,
  ManagerQueryDto,
} from './dto/manager.dto';
import { ManagerStatus } from './entities/manager.entity';

@ApiTags('managers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('managers')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiResponse({ status: 201, description: 'Manager created successfully' })
  async createManager(@Body() createManagerDto: CreateManagerDto) {
    return this.managerService.createManager(createManagerDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List of all managers' })
  async getAllManagers(@Query() query: ManagerQueryDto) {
    return this.managerService.getAllManagers(query);
  }

  @Get('stats')
  @ApiResponse({ status: 200, description: 'Manager statistics' })
  async getManagerStats() {
    return this.managerService.getManagerStats();
  }

  @Get('center/:center_id')
  @ApiResponse({ status: 200, description: 'Managers for specific center' })
  async getManagersByCenterId(@Param('center_id') center_id: number) {
    return this.managerService.getManagersByCenterId(center_id);
  }

  @Get(':manager_id')
  @ApiResponse({ status: 200, description: 'Manager details' })
  async getManagerById(@Param('manager_id') manager_id: number) {
    return this.managerService.getManagerById(manager_id);
  }

  @Get('user/:user_id')
  @ApiResponse({ status: 200, description: 'Manager by user ID' })
  async getManagerByUserId(@Param('user_id') user_id: number) {
    return this.managerService.getManagerByUserId(user_id);
  }

  @Patch(':manager_id')
  @ApiResponse({ status: 200, description: 'Manager updated successfully' })
  async updateManager(
    @Param('manager_id') manager_id: number,
    @Body() updateManagerDto: UpdateManagerDto,
  ) {
    return this.managerService.updateManager(manager_id, updateManagerDto);
  }

  @Patch(':manager_id/status')
  @ApiResponse({ status: 200, description: 'Manager status updated' })
  async updateManagerStatus(
    @Param('manager_id') manager_id: number,
    @Body('status') status: ManagerStatus,
  ) {
    return this.managerService.updateManagerStatus(manager_id, status);
  }

  @Delete(':manager_id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Manager deleted successfully' })
  async deleteManager(@Param('manager_id') manager_id: number) {
    return this.managerService.deleteManager(manager_id);
  }
}
