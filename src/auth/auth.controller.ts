import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { LoginDto } from '../users/dto/login.dto';
import { GoogleDto } from '../users/dto/google.dto';
import { verifyRecaptcha } from '../common/recaptcha.util';

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  // Registration - restricted to admin users
  @Post('register')
  async register(@Body() body: any) {
    // If recaptcha token provided, validate it; if verification fails, reject
    if (body.recaptchaToken) {
      try {
        const ok = await verifyRecaptcha(body.recaptchaToken);
        if (!ok) throw new BadRequestException('reCAPTCHA validation failed');
      } catch (e) {
        throw new BadRequestException('reCAPTCHA validation failed');
      }
    }
    // Note: Registration is currently restricted to admin users via the UsersService
    return this.usersService.create(body);
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: { token?: string }) {
    const token = body?.token;
    if (!token) throw new BadRequestException('token is required');
    return this.usersService.verifyEmail(token);
  }

  // Login (email/password) - public
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.usersService.login(body.email, body.password);
  }

  // Google sign-in (requires idToken) - public
  @Post('google')
  async google(@Body() body: GoogleDto) {
    // Temporary debug: log incoming Google sign-in body so we can confirm
    // whether requests reach the backend. Remove or reduce logging in prod.
    // eslint-disable-next-line no-console
    console.log('POST /auth/google body received:', body);
    return this.usersService.loginWithGoogle(
      body.google_id,
      body.email,
      body.username,
      body.idToken,
    );
  }

  @Post('refresh')
  async refresh(@Body() body: { user_id: number; hashedRefreshToken: string }) {
    return this.usersService.refreshTokens(
      body.user_id,
      body.hashedRefreshToken,
    );
  }

  @Post('logout/:id')
  @UseGuards(JwtAuthGuard)
  async logout(@Param('id') id: string) {
    return this.usersService.logout(Number(id));
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() body: { currentPassword: string; newPassword: string },
    @Req() req: any,
  ) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('User not authenticated');
    return this.usersService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );
  }

  @Post('send-verification-email')
  @UseGuards(JwtAuthGuard)
  async sendVerificationEmail(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) throw new BadRequestException('User not authenticated');
    return this.usersService.sendVerificationEmail(userId);
  }
}
