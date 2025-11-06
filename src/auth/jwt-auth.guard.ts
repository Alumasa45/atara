import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {
    console.log(
      'JwtAuthGuard initialized. JWT_SECRET env:',
      process.env.JWT_SECRET || 'not set (using default)',
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request & { user?: any }>();
    const auth = req.headers['authorization'];
    console.log(
      'JwtAuthGuard - Authorization header:',
      auth ? auth.substring(0, 30) + '...' : 'missing',
    );

    if (!auth) throw new UnauthorizedException('Missing Authorization header');
    const [type, token] = auth.split(' ');
    if (type !== 'Bearer' || !token)
      throw new UnauthorizedException('Invalid Authorization header');

    try {
      console.log('JwtAuthGuard - Attempting to verify token');
      const payload = await this.jwtService.verifyAsync(token);
      console.log(
        'JwtAuthGuard - Token verified successfully. Payload:',
        payload,
      );
      // attach payload to request.user for downstream guards/controllers
      req.user = payload;
      return true;
    } catch (err: any) {
      console.error('JwtAuthGuard - Token verification failed:', err.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
