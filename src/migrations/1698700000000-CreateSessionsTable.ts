import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessionsTable1698700000000 implements MigrationInterface {
  name = 'CreateSessionsTable1698700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('sessions');
    if (!has) {
      await queryRunner.query(`
        CREATE TABLE "sessions" (
          "session_id" SERIAL PRIMARY KEY,
          "trainer_id" integer,
          "category" varchar(50) NOT NULL,
          "description" varchar(100) NOT NULL,
          "duration_minutes" integer NOT NULL,
          "capacity" integer NOT NULL,
          "price" decimal(10,2) NOT NULL,
          "created_by" integer
        );
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('sessions');
    if (has) {
      await queryRunner.query(`DROP TABLE "sessions"`);
    }
  }
}
