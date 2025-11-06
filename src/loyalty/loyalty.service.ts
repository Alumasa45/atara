import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, role } from '../users/entities/user.entity';
import {
  Booking,
  status as BookingStatus,
} from '../bookings/entities/booking.entity';

@Injectable()
export class LoyaltyService {
  private readonly logger = new Logger(LoyaltyService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
  ) {}

  /**
   * Award points to a user
   * @param userId - User ID to award points to
   * @param points - Number of points to award
   * @param reason - Reason for awarding points (e.g., 'registration', 'session_completed')
   */
  async awardPoints(
    userId: number,
    points: number,
    reason: string = 'manual',
  ): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
      });

      if (!user) {
        this.logger.warn(`User ${userId} not found for loyalty points award`);
        return null;
      }

      user.loyalty_points = (user.loyalty_points || 0) + points;
      const updated = await this.userRepository.save(user);

      this.logger.log(
        `Awarded ${points} points to user ${userId} for: ${reason}. Total: ${updated.loyalty_points}`,
      );

      return updated;
    } catch (error) {
      this.logger.error(
        `Error awarding points to user ${userId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Deduct points from a user
   * @param userId - User ID
   * @param points - Number of points to deduct
   * @param reason - Reason for deducting points
   */
  async deductPoints(
    userId: number,
    points: number,
    reason: string = 'manual',
  ): Promise<User | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
      });

      if (!user) {
        this.logger.warn(
          `User ${userId} not found for loyalty points deduction`,
        );
        return null;
      }

      user.loyalty_points = Math.max(0, (user.loyalty_points || 0) - points);
      const updated = await this.userRepository.save(user);

      this.logger.log(
        `Deducted ${points} points from user ${userId} for: ${reason}. Total: ${updated.loyalty_points}`,
      );

      return updated;
    } catch (error) {
      this.logger.error(
        `Error deducting points from user ${userId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Award points when session is completed
   * @param bookingId - Booking ID that was completed
   * @param pointsToAward - Number of points to award (default 10)
   */
  async awardPointsForCompletedSession(
    bookingId: number,
    pointsToAward: number = 10,
  ): Promise<User | null> {
    try {
      const booking = await this.bookingRepository.findOne({
        where: { booking_id: bookingId },
        relations: ['user'],
      });

      if (!booking) {
        this.logger.warn(
          `Booking ${bookingId} not found for session completion`,
        );
        return null;
      }

      if (!booking.user_id) {
        this.logger.warn(
          `Booking ${bookingId} is a guest booking, no loyalty points awarded`,
        );
        return null;
      }

      return this.awardPoints(
        booking.user_id,
        pointsToAward,
        `session_completed (booking #${bookingId})`,
      );
    } catch (error) {
      this.logger.error(
        `Error awarding points for completed session ${bookingId}:`,
        error.message,
      );
      throw error;
    }
  }

  /**
   * Get user loyalty points
   * @param userId - User ID
   */
  async getUserPoints(userId: number): Promise<number> {
    try {
      const user = await this.userRepository.findOne({
        where: { user_id: userId },
      });

      return user?.loyalty_points || 0;
    } catch (error) {
      this.logger.error(
        `Error getting user points for ${userId}:`,
        error.message,
      );
      return 0;
    }
  }

  /**
   * Get leaderboard - top users by loyalty points
   * @param limit - Number of users to return
   */
  async getLeaderboard(limit: number = 10) {
    try {
      const users = await this.userRepository.find({
        where: { role: role.client },
        order: { loyalty_points: 'DESC' },
        take: limit,
        select: ['user_id', 'username', 'loyalty_points'],
      });

      return users;
    } catch (error) {
      this.logger.error('Error getting loyalty leaderboard:', error.message);
      return [];
    }
  }
}
