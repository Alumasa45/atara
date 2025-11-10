import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';
import { OwnerGuard } from './owner.guard';
import { UsersModule } from '../users/users.module';

const jwtSecret = process.env.JWT_SECRET || 'change_this_secret';
const jwtExpiresIn = (process.env.JWT_EXPIRES_IN || '1h') as '1h';

console.log('AuthModule - JWT Configuration:');
console.log('  JWT_SECRET:', jwtSecret);
console.log('  JWT_EXPIRES_IN:', jwtExpiresIn);

@Module({
  imports: [
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: jwtExpiresIn },
    }),
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [JwtAuthGuard, RolesGuard, OwnerGuard],
  exports: [JwtModule, JwtAuthGuard, RolesGuard, OwnerGuard],
})
export class AuthModule {}
