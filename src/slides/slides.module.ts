import { Module } from '@nestjs/common';
import { SlidesController } from './slides.controller';

@Module({
  controllers: [SlidesController],
})
export class SlidesModule {}
