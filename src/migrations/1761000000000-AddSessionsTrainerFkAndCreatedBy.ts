import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionsTrainerFkAndCreatedBy1761000000000
  implements MigrationInterface
{
  name = 'AddSessionsTrainerFkAndCreatedBy1761000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add trainer_id column if missing
    const hasTrainer = await queryRunner.hasColumn('sessions', 'trainer_id');
    if (!hasTrainer) {
      await queryRunner.query(
        `ALTER TABLE "sessions" ADD "trainer_id" integer`,
      );
    }

    // Add created_by column if missing
    const hasCreated = await queryRunner.hasColumn('sessions', 'created_by');
    if (!hasCreated) {
      await queryRunner.query(
        `ALTER TABLE "sessions" ADD "created_by" integer`,
      );
    }

    // Add FK constraints (trainer -> trainers.trainer_id) with ON DELETE CASCADE
    // and (created_by -> users.user_id) with ON DELETE SET NULL
    try {
      await queryRunner.query(
        `ALTER TABLE "sessions" ADD CONSTRAINT "FK_sessions_trainer" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("trainer_id") ON DELETE CASCADE`,
      );
    } catch (err) {
      // ignore if constraint exists or cannot be created
    }

    try {
      await queryRunner.query(
        `ALTER TABLE "sessions" ADD CONSTRAINT "FK_sessions_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL`,
      );
    } catch (err) {
      // ignore
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `ALTER TABLE "sessions" DROP CONSTRAINT "FK_sessions_trainer"`,
      );
    } catch (err) {}
    try {
      await queryRunner.query(
        `ALTER TABLE "sessions" DROP CONSTRAINT "FK_sessions_created_by"`,
      );
    } catch (err) {}

    const hasCreated = await queryRunner.hasColumn('sessions', 'created_by');
    if (hasCreated) {
      await queryRunner.query(
        `ALTER TABLE "sessions" DROP COLUMN "created_by"`,
      );
    }

    const hasTrainer = await queryRunner.hasColumn('sessions', 'trainer_id');
    if (hasTrainer) {
      await queryRunner.query(
        `ALTER TABLE "sessions" DROP COLUMN "trainer_id"`,
      );
    }
  }
}
