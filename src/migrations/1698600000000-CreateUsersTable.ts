import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1698600000000 implements MigrationInterface {
  name = 'CreateUsersTable1698600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('users');
    if (!has) {
      await queryRunner.query(`
        CREATE TABLE "users" (
          "user_id" SERIAL PRIMARY KEY,
          "username" varchar(50) NOT NULL UNIQUE,
          "email" varchar(100) NOT NULL UNIQUE,
          "phone" varchar(15) UNIQUE,
          "google_id" varchar(100) UNIQUE,
          "password" varchar(255),
          "role" varchar(20) NOT NULL DEFAULT 'client',
          "status" varchar(20) NOT NULL DEFAULT 'active',
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
          "hashed_refresh_token" varchar(255)
        );
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('users');
    if (has) {
      await queryRunner.query(`DROP TABLE "users"`);
    }
  }
}
