import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

const srcPath = __dirname;

const AppDataSource = new DataSource({
  type: (process.env.DB_TYPE as any) || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5434,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || process.env.DB_DATABASE || 'atara',
  synchronize: false,
  logging: false,
  entities: [join(srcPath, '**', '*.entity.{ts,js}')],
  migrations: [join(srcPath, 'migrations', '*.{ts,js}')],
});

export default AppDataSource;
