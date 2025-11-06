import {
  Controller,
  Get,
  Param,
  Patch,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  // get profile by user id (admin or owner)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':userId')
  async getProfile(@Param('userId') userId: string, @Request() req: any) {
    const uid = parseInt(userId, 10);
    // RolesGuard will handle admin/manager scopes; if client, ensure owner
    if (req.user?.role === 'client' && req.user?.userId !== uid) {
      return { ok: false, message: 'Forbidden' };
    }
    return this.profilesService.findByUserId(uid);
  }

  // admin can set points explicitly
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':userId')
  async setPoints(
    @Param('userId') userId: string,
    @Body() body: any,
    @Request() req: any,
  ) {
    const uid = parseInt(userId, 10);
    // only admin/manager allowed to set points directly
    if (!['admin', 'manager'].includes(req.user?.role)) {
      return { ok: false, message: 'Forbidden' };
    }
    const points = Number(body.points ?? 0);
    return this.profilesService.setPoints(uid, points);
  }
}
