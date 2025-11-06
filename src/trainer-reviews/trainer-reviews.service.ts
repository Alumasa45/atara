import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainerReview } from './entities/trainer-review.entity';
import {
  CreateTrainerReviewDto,
  UpdateTrainerReviewDto,
} from './dto/trainer-review.dto';
import { Trainer } from '../trainers/entities/trainer.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TrainerReviewsService {
  constructor(
    @InjectRepository(TrainerReview)
    private readonly reviewRepository: Repository<TrainerReview>,
    @InjectRepository(Trainer)
    private readonly trainerRepository: Repository<Trainer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new review for a trainer
   */
  async createReview(
    trainerId: number,
    userId: number,
    createDto: CreateTrainerReviewDto,
  ) {
    // Verify trainer exists
    const trainer = await this.trainerRepository.findOne({
      where: { trainer_id: trainerId },
    });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Validate rating
    if (createDto.rating < 1 || createDto.rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Check if user already reviewed this trainer
    const existingReview = await this.reviewRepository.findOne({
      where: {
        trainer_id: trainerId,
        user_id: userId,
      },
    });

    if (existingReview) {
      throw new BadRequestException(
        'You have already reviewed this trainer. Use update to modify your review.',
      );
    }

    // Create review
    const review = this.reviewRepository.create({
      trainer_id: trainerId,
      user_id: userId,
      rating: createDto.rating,
      review_text: createDto.review_text,
    });

    return await this.reviewRepository.save(review);
  }

  /**
   * Get all reviews for a trainer
   */
  async getTrainerReviews(trainerId: number, page = 1, limit = 10) {
    // Verify trainer exists
    const trainer = await this.trainerRepository.findOne({
      where: { trainer_id: trainerId },
    });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { trainer_id: trainerId },
      relations: ['user'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    // Calculate average rating
    const avgRating =
      total > 0
        ? parseFloat(
            (
              reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            ).toFixed(2),
          )
        : 0;

    return {
      data: reviews,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      averageRating: avgRating,
      totalRatings: total,
    };
  }

  /**
   * Get a single review by ID
   */
  async getReviewById(reviewId: number) {
    const review = await this.reviewRepository.findOne({
      where: { review_id: reviewId },
      relations: ['trainer', 'user'],
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    return review;
  }

  /**
   * Update a review (only by the reviewer)
   */
  async updateReview(
    reviewId: number,
    userId: number,
    updateDto: UpdateTrainerReviewDto,
  ) {
    const review = await this.getReviewById(reviewId);

    // Verify ownership
    if (review.user_id !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Validate rating if provided
    if (updateDto.rating && (updateDto.rating < 1 || updateDto.rating > 5)) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    // Update fields
    if (updateDto.rating) review.rating = updateDto.rating;
    if (updateDto.review_text !== undefined)
      review.review_text = updateDto.review_text;

    return await this.reviewRepository.save(review);
  }

  /**
   * Delete a review (only by the reviewer or admin)
   */
  async deleteReview(reviewId: number, userId: number, userRole: string) {
    const review = await this.getReviewById(reviewId);

    // Verify ownership or admin role
    if (review.user_id !== userId && userRole !== 'admin') {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    await this.reviewRepository.remove(review);
    return { message: 'Review deleted successfully' };
  }

  /**
   * Get trainer statistics including average rating
   */
  async getTrainerStats(trainerId: number) {
    // Verify trainer exists
    const trainer = await this.trainerRepository.findOne({
      where: { trainer_id: trainerId },
    });
    if (!trainer) {
      throw new NotFoundException(`Trainer with ID ${trainerId} not found`);
    }

    const reviews = await this.reviewRepository.find({
      where: { trainer_id: trainerId },
    });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? parseFloat(
            (
              reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
            ).toFixed(2),
          )
        : 0;

    // Calculate rating distribution
    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    };

    return {
      trainerId,
      totalReviews,
      averageRating,
      ratingDistribution,
    };
  }

  /**
   * Get user's review for a specific trainer (if exists)
   */
  async getUserReview(trainerId: number, userId: number) {
    const review = await this.reviewRepository.findOne({
      where: {
        trainer_id: trainerId,
        user_id: userId,
      },
    });

    return review || null;
  }

  /**
   * Get all reviews by a user
   */
  async getUserReviews(userId: number, page = 1, limit = 10) {
    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const skip = (page - 1) * limit;

    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { user_id: userId },
      relations: ['trainer'],
      order: { created_at: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: reviews,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }
}
