import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthController } from '../auth/auth.controller';
import { AuthModule } from '../auth/auth.module';
import { User } from './entities/user.entity';
import { EmailVerification } from './entities/email-verification.entity';
import { Trainer } from '../trainers/entities/trainer.entity';
import { MailService } from '../mail/mail.service';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  controllers: [UsersController, AuthController],
  providers: [UsersService, MailService],
  imports: [
    TypeOrmModule.forFeature([User, EmailVerification, Trainer]),
    forwardRef(() => ProfilesModule),
    forwardRef(() => AuthModule),
  ],
  exports: [TypeOrmModule, UsersService, AuthModule],
})
export class UsersModule {}
