import {
  Controller,
  Get,
  Param,
  UseGuards,
  Query,
  Logger,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { LoyaltyService } from './loyalty.service';

@ApiTags('loyalty')
@Controller('loyalty')
export class LoyaltyController {
  private readonly logger = new Logger(LoyaltyController.name);

  constructor(private readonly loyaltyService: LoyaltyService) {}

  /**
   * Get current user's loyalty points
   */
  @Get('my-points')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user loyalty points',
  })
  async getMyPoints(@Request() req: any) {
    const points = await this.loyaltyService.getUserPoints(req.user.user_id);
    return { loyalty_points: points };
  }

  /**
   * Get any user's loyalty points (admin only)
   */
  @Get('user/:userId/points')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get user loyalty points (admin only)',
  })
  async getUserPoints(@Param('userId') userId: string) {
    const points = await this.loyaltyService.getUserPoints(parseInt(userId));
    return { user_id: parseInt(userId), loyalty_points: points };
  }

  /**
   * Get loyalty leaderboard
   */
  @Get('leaderboard')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get loyalty points leaderboard',
  })
  async getLeaderboard(@Query('limit') limit: string = '10') {
    const leaderboard = await this.loyaltyService.getLeaderboard(
      Math.min(parseInt(limit) || 10, 50),
    );
    return leaderboard;
  }
}
