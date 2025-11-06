import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional, IsString } from 'class-validator';

export class CreateTrainerReviewDto {
  @ApiProperty({
    description: 'Star rating for the trainer (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Review text/feedback (optional)',
    example: 'Great trainer! Very knowledgeable and motivating.',
    required: false,
  })
  @IsOptional()
  @IsString()
  review_text?: string;
}

export class UpdateTrainerReviewDto {
  @ApiProperty({
    description: 'Star rating for the trainer (1-5)',
    example: 5,
    minimum: 1,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({
    description: 'Review text/feedback (optional)',
    example: 'Great trainer! Very knowledgeable and motivating.',
    required: false,
  })
  @IsOptional()
  @IsString()
  review_text?: string;
}
