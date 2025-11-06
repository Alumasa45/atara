import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TrainerReviewsService } from './trainer-reviews.service';
import {
  CreateTrainerReviewDto,
  UpdateTrainerReviewDto,
} from './dto/trainer-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Trainer Reviews')
@ApiBearerAuth('access-token')
@Controller('trainer-reviews')
@UseGuards(JwtAuthGuard)
export class TrainerReviewsController {
  constructor(private readonly reviewsService: TrainerReviewsService) {}

  /**
   * Create a new review for a trainer
   */
  @Post('trainers/:trainerId/reviews')
  @ApiOperation({ summary: 'Create a review for a trainer' })
  async createReview(
    @Param('trainerId', ParseIntPipe) trainerId: number,
    @Body() createDto: CreateTrainerReviewDto,
    @Request() req: any,
  ) {
    return this.reviewsService.createReview(
      trainerId,
      req.user.user_id,
      createDto,
    );
  }

  /**
   * Get all reviews for a trainer
   */
  @Get('trainers/:trainerId/reviews')
  @ApiOperation({ summary: 'Get all reviews for a trainer' })
  async getTrainerReviews(
    @Param('trainerId', ParseIntPipe) trainerId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reviewsService.getTrainerReviews(trainerId, page, limit);
  }

  /**
   * Get trainer review statistics
   */
  @Get('trainers/:trainerId/stats')
  @ApiOperation({ summary: 'Get review statistics for a trainer' })
  async getTrainerStats(@Param('trainerId', ParseIntPipe) trainerId: number) {
    return this.reviewsService.getTrainerStats(trainerId);
  }

  /**
   * Get user's review for a specific trainer
   */
  @Get('trainers/:trainerId/my-review')
  @ApiOperation({ summary: 'Get your review for a trainer' })
  async getMyReview(
    @Param('trainerId', ParseIntPipe) trainerId: number,
    @Request() req: any,
  ) {
    const review = await this.reviewsService.getUserReview(
      trainerId,
      req.user.user_id,
    );
    return review || { message: 'No review found' };
  }

  /**
   * Get a single review by ID
   */
  @Get('reviews/:reviewId')
  @ApiOperation({ summary: 'Get a single review by ID' })
  async getReview(@Param('reviewId', ParseIntPipe) reviewId: number) {
    return this.reviewsService.getReviewById(reviewId);
  }

  /**
   * Update a review
   */
  @Put('reviews/:reviewId')
  @ApiOperation({ summary: 'Update a review (owner only)' })
  async updateReview(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Body() updateDto: UpdateTrainerReviewDto,
    @Request() req: any,
  ) {
    return this.reviewsService.updateReview(
      reviewId,
      req.user.user_id,
      updateDto,
    );
  }

  /**
   * Delete a review
   */
  @Delete('reviews/:reviewId')
  @ApiOperation({ summary: 'Delete a review (owner or admin only)' })
  async deleteReview(
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Request() req: any,
  ) {
    return this.reviewsService.deleteReview(
      reviewId,
      req.user.user_id,
      req.user.role,
    );
  }

  /**
   * Get all reviews by current user
   */
  @Get('my-reviews')
  @ApiOperation({ summary: 'Get all your reviews' })
  async getMyReviews(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Request() req: any,
  ) {
    return this.reviewsService.getUserReviews(req.user.user_id, page, limit);
  }

  /**
   * Get all reviews by a user (admin view)
   */
  @Get('users/:userId/reviews')
  @ApiOperation({ summary: 'Get all reviews by a user' })
  async getUserReviews(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.reviewsService.getUserReviews(userId, page, limit);
  }
}
