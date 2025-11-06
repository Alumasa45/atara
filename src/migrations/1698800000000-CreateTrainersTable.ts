import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTrainersTable1698800000000 implements MigrationInterface {
  name = 'CreateTrainersTable1698800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('trainers');
    if (!has) {
      await queryRunner.query(`
        CREATE TABLE "trainers" (
          "trainer_id" SERIAL PRIMARY KEY,
          "user_id" integer,
          "name" varchar(100) NOT NULL,
          "specialty" varchar(50) NOT NULL,
          "phone" varchar(15) NOT NULL,
          "email" varchar(100) NOT NULL,
          "bio" text NOT NULL,
          "status" varchar(20) NOT NULL DEFAULT 'active'
        );
      `);
    }

    // add FK to users.user_id
    try {
      await queryRunner.query(
        `ALTER TABLE "trainers" ADD CONSTRAINT "FK_trainers_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE`,
      );
    } catch (e) {
      // ignore if constraint already exists or cannot be created
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `ALTER TABLE "trainers" DROP CONSTRAINT "FK_trainers_user"`,
      );
    } catch (e) {}

    const has = await queryRunner.hasTable('trainers');
    if (has) {
      await queryRunner.query(`DROP TABLE "trainers"`);
    }
  }
}
