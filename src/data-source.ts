import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

const srcPath = __dirname;

const AppDataSource = new DataSource({
  type: 'postgres',
  // Use DATABASE_URL if available (Render), otherwise use individual env vars (local/Docker)
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL
    ? undefined
    : process.env.DB_HOST || 'localhost',
  port: process.env.DATABASE_URL
    ? undefined
    : process.env.DB_PORT
      ? Number(process.env.DB_PORT)
      : 5432,
  username: process.env.DATABASE_URL
    ? undefined
    : process.env.DB_USERNAME || 'postgres',
  password: process.env.DATABASE_URL
    ? undefined
    : process.env.DB_PASSWORD || 'postgres',
  database: process.env.DATABASE_URL
    ? undefined
    : process.env.DB_NAME || process.env.DB_DATABASE || 'atara',
  // Render requires SSL
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
  entities: [join(srcPath, '**', '*.entity.{ts,js}')],
  migrations: [join(srcPath, 'migrations', '*.{ts,js}')],
});

export default AppDataSource;
