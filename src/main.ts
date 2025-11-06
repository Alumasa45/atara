import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { rateLimitMiddleware } from './common/rate-limit.middleware';

async function bootstrap() {
  // startup validation for required envs
  if (!process.env.GOOGLE_CLIENT_ID) {
    console.error('Missing required env: GOOGLE_CLIENT_ID');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule);
  // Enable CORS so the frontend dev server can call this API.
  // Allow configuring origins via CORS_ORIGIN env var (comma-separated).
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : ['http://localhost:5173', 'http://localhost:3000'];
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });
  // apply a simple rate limiter for sensitive auth endpoints
  app.use(rateLimitMiddleware as any);
  // enable global validation pipe (whitelists DTO props)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
