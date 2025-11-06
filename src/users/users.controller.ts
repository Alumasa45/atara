import {
  Controller,
  Get,
  Patch,
  Param,
  Delete,
  UseGuards,
  Body,
  Req,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { OwnerGuard } from '../auth/owner.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Standard CRUD for users. Auth operations moved to `AuthController`.

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req: any) {
    const userId = req.user.userId;
    return this.usersService.findOne(userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    const p = page ? Number(page) : 1;
    const l = limit ? Number(limit) : 20;
    return this.usersService.findAll({ page: p, limit: l });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @UseGuards(JwtAuthGuard, OwnerGuard)
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req?: any,
  ) {
    // Users can update their own profile
    // Admins/managers can update any user
    const currentUser = req?.user;
    const targetUserId = Number(id);

    // Check if user is updating their own profile OR if they're admin/manager
    const isOwner = currentUser?.userId === targetUserId;
    const isAdminOrManager =
      currentUser?.role === 'admin' || currentUser?.role === 'manager';

    if (!isOwner && !isAdminOrManager) {
      throw new ForbiddenException('You can only update your own profile');
    }

    return this.usersService.update(+id, updateUserDto, currentUser);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user by ID' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async delete(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
