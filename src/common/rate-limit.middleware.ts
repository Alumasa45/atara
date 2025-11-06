import { Request, Response, NextFunction } from 'express';

type Entry = { count: number; first: number };

const stores: Record<string, Entry> = {};

// Simple in-memory rate limiter for a few sensitive endpoints
export function rateLimitMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const ip = (req.ip ||
      (req.connection as any)?.remoteAddress ||
      'unknown') as string;
    const key = `${ip}:${req.path}`;

    // Apply limits only to auth/register and auth/login
    if (
      !req.path.startsWith('/auth/register') &&
      !req.path.startsWith('/auth/login')
    ) {
      return next();
    }

    const now = Date.now();
    const bucket = stores[key] ?? { count: 0, first: now };

    // window and limit: registration = 5 per 10 minutes, login = 10 per minute
    const isRegister = req.path.startsWith('/auth/register');
    const windowMs = isRegister ? 10 * 60 * 1000 : 60 * 1000;
    const limit = isRegister ? 5 : 10;

    if (now - bucket.first > windowMs) {
      // reset
      bucket.count = 1;
      bucket.first = now;
    } else {
      bucket.count = (bucket.count || 0) + 1;
    }

    stores[key] = bucket;

    if (bucket.count > limit) {
      res
        .status(429)
        .json({ ok: false, message: 'Too many requests, try again later' });
      return;
    }

    next();
  } catch (e) {
    // Fail open
    next();
  }
}
