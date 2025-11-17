import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ProfilesService } from '../profiles/profiles.service';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

import { EmailVerification } from './entities/email-verification.entity';
import { MailService } from '../mail/mail.service';
import { Trainer } from '../trainers/entities/trainer.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(EmailVerification)
    private readonly verificationRepository: Repository<EmailVerification>,
    @InjectRepository(Trainer)
    private readonly trainerRepository: Repository<Trainer>,
    private readonly jwtService: JwtService,
    private readonly profilesService: ProfilesService,
    private readonly mailService: MailService,
  ) {}

  // Google OAuth2 client; requires GOOGLE_CLIENT_ID in env
  private oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  private async generateAccessToken(user: User): Promise<string> {
    return this.jwtService.signAsync({ userId: user.user_id, role: user.role });
  }

  create(createUserDto: CreateUserDto) {
    // register a new user; supports Google sign-up when google_id is provided
    return (async () => {
      const { email, username, password, google_id, role, status, phone } =
        createUserDto as any;

      const existing = await this.userRepository.findOne({
        where: [{ email }, { username }, { google_id }],
      });
      if (existing) {
        throw new ConflictException(
          'User with provided email/username/google_id already exists',
        );
      }

      const user = new User();
      user.email = email;
      user.username = username;
      user.google_id = google_id ?? null;
      user.phone = phone ?? null;
      user.role = role ?? 'client'; // Default to 'client' if not provided
      user.status = status ?? 'active'; // Default to 'active' if not provided
      user.loyalty_points = 5; // Award 5 initial points on registration
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      const saved = await this.userRepository.save(user);

      // create profile and award initial signup points (5)
      try {
        await this.profilesService.createForUser(saved, 5);
      } catch (e) {
        // don't fail registration on profile creation issues
      }

      // Auto-create trainer profile if user role is 'trainer'
      if (saved.role === 'trainer') {
        try {
          const trainer = new Trainer();
          trainer.user = saved;
          trainer.name = saved.username;
          trainer.email = saved.email;
          trainer.phone = saved.phone;
          trainer.specialty = 'general'; // default specialty
          trainer.bio = '';
          trainer.status = 'active';
          await this.trainerRepository.save(trainer);
        } catch (e) {
          console.warn('Failed to create trainer profile:', e);
        }
      }
      // create email verification token and send email
      try {
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const v = this.verificationRepository.create({
          token,
          user: saved,
          expires_at: expires,
        });
        await this.verificationRepository.save(v);
        await this.mailService.sendVerificationEmail(saved.email, token);
      } catch (e) {
        // non-fatal
        console.warn('Failed to create/send verification email', e);
      }

      // Generate JWT tokens for immediate authentication after signup
      try {
        const accessToken = await this.generateAccessToken(saved);
        const refreshToken = crypto.randomBytes(64).toString('hex');
        await this.setCurrentRefreshToken(refreshToken, saved.user_id);

        // Do not return password or hashed token
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const {
          password: _p,
          hashed_refresh_token: _h,
          ...safe
        } = saved as any;
        return {
          access_token: accessToken,
          refresh_token: refreshToken,
          user: safe,
        };
      } catch (e) {
        // Token generation failed, but user was successfully created
        // Return user without tokens so they can login normally
        console.warn('Failed to generate tokens for new user', e);
        const {
          password: _p,
          hashed_refresh_token: _h,
          ...safe
        } = saved as any;
        return {
          user: safe,
          message:
            'User created successfully but token generation failed. Please login to continue.',
        };
      }
    })();
  }

  async verifyEmail(token: string) {
    const v = await this.verificationRepository.findOne({
      where: { token },
      relations: ['user'],
    });
    if (!v) throw new NotFoundException('Verification token not found');
    if (v.expires_at.getTime() < Date.now()) {
      // expired
      await this.verificationRepository.delete({ id: v.id } as any);
      throw new BadRequestException('Verification token expired');
    }
    const user = v.user as any;
    // set a new column email_verified if present
    try {
      (user as any).email_verified = true;
      await this.userRepository.save(user);
      await this.verificationRepository.delete({ id: v.id } as any);
      return { ok: true };
    } catch (e) {
      throw new BadRequestException('Failed to verify email');
    }
  }

  async findAll(opts?: { page?: number; limit?: number }) {
    const page = opts?.page && opts.page > 0 ? opts.page : 1;
    const limit =
      opts?.limit && opts.limit > 0 ? Math.min(opts.limit, 100) : 20;
    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { user_id: 'ASC' },
    });

    const data = users.map((u) => {
      // omit sensitive fields
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _p, hashed_refresh_token: _h, ...safe } = u as any;
      return safe;
    });

    return { data, total, page, limit };
  }

  findOne(id: number) {
    return this.userRepository
      .findOne({ where: { user_id: id } })
      .then((user) => {
        if (!user) throw new NotFoundException('User not found');
        const { password: _p, hashed_refresh_token: _h, ...safe } = user as any;
        return safe;
      });
  }

  update(id: number, updateUserDto: UpdateUserDto, currentUser?: any) {
    return (async () => {
      const user = await this.userRepository.findOne({
        where: { user_id: id },
      });
      if (!user) throw new NotFoundException('User not found');

      // Check if caller is admin or manager
      const callerIsAdmin =
        currentUser &&
        (currentUser.role === 'admin' || currentUser.role === 'manager');

      // Extract fields that might be sensitive
      const {
        hashed_refresh_token,
        password,
        role,
        status,
        google_id,
        ...rest
      } = updateUserDto as any;

      // If caller is not admin/manager, don't allow changing role, status, or google_id
      if (!callerIsAdmin) {
        delete rest.role;
        delete rest.status;
        delete rest.google_id;
      }

      // Update basic fields
      if (password) {
        user.password = await bcrypt.hash(password, 10);
      }

      Object.assign(user, rest);

      // Only admins/managers can update role and status
      if (callerIsAdmin) {
        if (role !== undefined) user.role = role;
        if (status !== undefined) user.status = status;
        if (google_id !== undefined) user.google_id = google_id;
      }

      const saved = await this.userRepository.save(user);
      const { password: _p, hashed_refresh_token: _h, ...safe } = saved as any;
      return safe;
    })();
  }

  remove(id: number) {
    return (async () => {
      const user = await this.userRepository.findOne({
        where: { user_id: id },
      });
      if (!user) throw new NotFoundException('User not found');
      
      // Auto-delete trainer profile if user is a trainer
      if (user.role === 'trainer') {
        try {
          await this.trainerRepository.delete({ user: { user_id: id } });
        } catch (e) {
          console.warn('Failed to delete trainer profile:', e);
        }
      }
      
      await this.userRepository.delete({ user_id: id });
      return { ok: true };
    })();
  }

  // Email/password login
  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    if (!user.password) {
      // No password set => probably registered with Google
      throw new ForbiddenException(
        'No local password set. Please sign in with Google',
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const accessToken = await this.generateAccessToken(user);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    await this.setCurrentRefreshToken(refreshToken, user.user_id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { ...user, password: undefined, hashed_refresh_token: undefined },
    };
  }

  // Google sign-in/up with server-side idToken verification
  async loginWithGoogle(
    google_id?: string,
    email?: string,
    username?: string,
    idToken?: string,
  ) {
    // Require idToken for server-side verification
    if (!idToken) {
      throw new BadRequestException('idToken is required for Google sign-in');
    }

    // Verify idToken with Google's OAuth2 API
    const ticket = await this.oauthClient
      .verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      .catch((err) => {
        // Log the real Google verification error to help debugging (temporary)
        // Keep the thrown UnauthorizedException to preserve current behavior.
        // Remove or guard this logging in production if you prefer not to log external errors.
        // eslint-disable-next-line no-console
        console.error('Google verifyIdToken error:', err);
        throw new UnauthorizedException('Invalid Google ID token');
      });

    const payload = ticket.getPayload();
    if (!payload)
      throw new UnauthorizedException('Invalid Google token payload');

    const sub = payload['sub'];
    const verifiedEmail = payload['email'];

    // If Google reports the email but it's not verified, reject sign-in to
    // avoid creating/linking accounts with unverified emails.
    const emailVerifiedFlag = payload['email_verified'];
    if (verifiedEmail && emailVerifiedFlag === false) {
      throw new UnauthorizedException('Google account email not verified');
    }

    if (!sub) throw new UnauthorizedException('Google token missing subject');

    // If client provided google_id, ensure it matches the verified sub
    if (google_id && google_id !== sub) {
      throw new BadRequestException(
        'Provided google_id does not match idToken',
      );
    }

    // use the verified sub as google_id and prefer verified email
    const verifiedGoogleId = sub;
    const verifiedEmailToUse = verifiedEmail ?? email;

    let user = await this.userRepository.findOne({
      where: [{ google_id: verifiedGoogleId }, { email: verifiedEmailToUse }],
    });

    if (!user) {
      // create user
      user = new User();
      user.google_id = verifiedGoogleId;
      if (verifiedEmailToUse) user.email = verifiedEmailToUse;
      user.username = username ?? verifiedEmailToUse ?? `g-${Date.now()}`;
      user.loyalty_points = 5; // Award 5 initial points on registration
      const saved = await this.userRepository.save(user);
      user = saved;
      // create profile with initial points
      try {
        await this.profilesService.createForUser(user, 5);
      } catch (e) {}
    } else if (!user.google_id) {
      // Link google id to existing account
      user.google_id = verifiedGoogleId;
      await this.userRepository.save(user);
    }

    const accessToken = await this.generateAccessToken(user);
    const refreshToken = crypto.randomBytes(64).toString('hex');
    await this.setCurrentRefreshToken(refreshToken, user.user_id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: { ...user, password: undefined, hashed_refresh_token: undefined },
    };
  }

  // Store hashed refresh token on user
  private async setCurrentRefreshToken(refreshToken: string, userId: number) {
    const hashed = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update({ user_id: userId }, {
      hashed_refresh_token: hashed,
    } as any);
  }

  // Exchange a refresh token for new tokens
  async refreshTokens(user_id: number, refreshToken: string) {
    const user = await this.userRepository.findOne({ where: { user_id } });
    if (!user || !user.hashed_refresh_token)
      throw new ForbiddenException('Access Denied');

    const isMatch = await bcrypt.compare(
      refreshToken,
      user.hashed_refresh_token,
    );
    if (!isMatch) throw new ForbiddenException('Invalid refresh token');

    const accessToken = await this.generateAccessToken(user);
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    await this.setCurrentRefreshToken(newRefreshToken, user.user_id);

    return { access_token: accessToken, refresh_token: newRefreshToken };
  }

  async logout(userId: number) {
    await this.userRepository.update({ user_id: userId }, {
      hashed_refresh_token: null,
    } as any);
    return { ok: true };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new ForbiddenException('Current password is incorrect');

    // Hash new password
    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { ok: true, message: 'Password changed successfully' };
  }

  async sendVerificationEmail(userId: number) {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    if (user.email_verified) {
      return { ok: true, message: 'Email is already verified' };
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 24);

    const verification = this.verificationRepository.create({
      user,
      token: verificationToken,
      expires_at: expiration,
    });
    await this.verificationRepository.save(verification);

    // Send verification email
    const verificationLink = `${process.env.APP_BASE_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
    try {
      await this.mailService.sendVerificationEmail(
        user.email,
        verificationLink,
      );
      return { ok: true, message: 'Verification email sent' };
    } catch (err) {
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }
  }
}
