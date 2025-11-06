import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainerReviewsService } from './trainer-reviews.service';
import { TrainerReviewsController } from './trainer-reviews.controller';
import { TrainerReview } from './entities/trainer-review.entity';
import { Trainer } from '../trainers/entities/trainer.entity';
import { User } from '../users/entities/user.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainerReview, Trainer, User]),
    AuthModule,
  ],
  controllers: [TrainerReviewsController],
  providers: [TrainerReviewsService],
  exports: [TrainerReviewsService],
})
export class TrainerReviewsModule {}
