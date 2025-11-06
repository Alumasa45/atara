import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class OwnerGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const user = req.user; // attached by JwtAuthGuard
    const idParam = req.params?.id;

    if (!user) return false;

    // admins can always proceed
    if (user.role === 'admin') return true;

    // owner allowed when their userId matches the id param
    const userId = Number(user.userId ?? user.user_id ?? user.userId);
    const targetId = Number(idParam);
    return userId === targetId;
  }
}
