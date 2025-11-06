import { Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthController } from './auth/auth.controller';
import { TrainersModule } from './trainers/trainers.module';
import { SessionsModule } from './sessions/sessions.module';
import { ScheduleModule } from './schedule/schedule.module';
import { BookingsModule } from './bookings/bookings.module';
import { CancellationRequestsModule } from './cancellation-requests/cancellation-requests.module';
import { DashboardModule } from './dashboards/dashboard.module';
import { AdminModule } from './admin/admin.module';
import { ManagerModule } from './managers/manager.module';
import { MembershipsModule } from './memberships/memberships.module';
import { LoyaltyModule } from './loyalty/loyalty.module';
import { TrainerReviewsModule } from './trainer-reviews/trainer-reviews.module';

@Module({
  imports: [
    // Load config FIRST so environment variables are available to other modules
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // TypeORM global configuration so repositories and DataSource are available
    TypeOrmModule.forRoot({
      type: 'postgres',
      // Use DATABASE_URL if available (Render), otherwise use individual env vars (local/Docker)
      url: process.env.DATABASE_URL,
      host: process.env.DATABASE_URL ? undefined : (process.env.DB_HOST || 'localhost'),
      port: process.env.DATABASE_URL ? undefined : (process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432),
      username: process.env.DATABASE_URL ? undefined : (process.env.DB_USERNAME || 'postgres'),
      password: process.env.DATABASE_URL ? undefined : (process.env.DB_PASSWORD || 'aquinattaayo'),
      database: process.env.DATABASE_URL ? undefined : (process.env.DB_DATABASE || 'atara'),
      // Render requires SSL
      ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
      synchronize: false,
      logging: false,
      entities: [join(__dirname, '**', '*.entity.{ts,js}')],
      migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: [
        '^/api',
        '^/auth',
        '^/dashboard',
        '^/users',
        '^/trainers',
        '^/sessions',
        '^/schedule',
        '^/bookings',
        '^/cancellation-requests',
        '^/profiles',
      ],
    }),
    // slides endpoint to list public images
    require('./slides/slides.module').SlidesModule,
    UsersModule,
    TrainersModule,
    SessionsModule,
    ScheduleModule,
    BookingsModule,
    CancellationRequestsModule,
    DashboardModule,
    AdminModule,
    ManagerModule,
    MembershipsModule,
    LoyaltyModule,
    TrainerReviewsModule,
  ],
  controllers: [AuthController],
  providers: [],
})
export class AppModule {}
