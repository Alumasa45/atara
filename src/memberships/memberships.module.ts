import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MembershipsService } from './memberships.service';
import { MembershipsController } from './memberships.controller';
import { MembershipPlan } from './entities/membership-plan.entity';
import { MembershipSubscription } from './entities/membership-subscription.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([MembershipPlan, MembershipSubscription]),
    AuthModule,
  ],
  providers: [MembershipsService],
  controllers: [MembershipsController],
  exports: [MembershipsService],
})
export class MembershipsModule {}
