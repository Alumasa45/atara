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

  // Remove global prefix for now

  // Enable CORS so the frontend dev server can call this API.
  // Allow configuring origins via CORS_ORIGIN env var (comma-separated).
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
    : ['http://localhost:5173', 'http://localhost:3000', 'https://atara-1.onrender.com'];

  console.log('🌐 CORS enabled for origins:', corsOrigins);

  app.enableCors({
    origin: corsOrigins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 200,
  });

  // Additional CORS middleware for edge cases
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (corsOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // apply a simple rate limiter for sensitive auth endpoints
  app.use(rateLimitMiddleware as any);

  // enable global validation pipe (whitelists DTO props)
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log('📋 Available routes:');
  console.log('  GET  /health');
  console.log('  GET  /schedule');
  console.log('  GET  /trainers');
  console.log('  GET  /sessions');
  console.log('  POST /auth/login');
  console.log('  POST /auth/google');
  console.log('  POST /auth/register');
}

bootstrap();
