import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSessionGroupsAndAdjustBookings1762000000000
  implements MigrationInterface
{
  name = 'CreateSessionGroupsAndAdjustBookings1762000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // create session_groups table if missing
    const hasTable = await queryRunner.hasTable('session_groups');
    if (!hasTable) {
      await queryRunner.query(`
        CREATE TABLE "session_groups" (
          "id" SERIAL PRIMARY KEY,
          "schedule_id" integer,
          "group_number" integer NOT NULL DEFAULT 0,
          "capacity" integer NOT NULL,
          "current_count" integer NOT NULL DEFAULT 0,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        );
      `);
    }

    // add unique index on schedule_id + group_number
    try {
      await queryRunner.query(
        `CREATE UNIQUE INDEX IF NOT EXISTS "IDX_session_groups_schedule_group" ON "session_groups" ("schedule_id", "group_number");`,
      );
    } catch (err) {}

    // ensure bookings has group_id column
    const hasGroupCol = await queryRunner.hasColumn('bookings', 'group_id');
    if (!hasGroupCol) {
      await queryRunner.query(
        `ALTER TABLE "bookings" ADD COLUMN "group_id" integer`,
      );
    }

    // make user_id nullable
    try {
      await queryRunner.query(
        `ALTER TABLE "bookings" ALTER COLUMN "user_id" DROP NOT NULL`,
      );
    } catch (err) {}

    // add FK: session_groups(schedule_id) -> schedules(schedule_id)
    try {
      await queryRunner.query(
        `ALTER TABLE "session_groups" ADD CONSTRAINT "FK_session_groups_schedule" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("schedule_id") ON DELETE CASCADE`,
      );
    } catch (err) {}

    // add FK booking.group_id -> session_groups.id
    try {
      await queryRunner.query(
        `ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_group" FOREIGN KEY ("group_id") REFERENCES "session_groups"("id") ON DELETE SET NULL`,
      );
    } catch (err) {}

    // add FK booking.user_id -> users.user_id if not exists
    try {
      const existingFkUser: any[] = await queryRunner.query(
        `SELECT conname FROM pg_constraint WHERE conname = 'FK_bookings_user'`,
      );
      if (!existingFkUser || existingFkUser.length === 0) {
        await queryRunner.query(
          `ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL`,
        );
      }
    } catch (err) {}

    // add FK booking.schedule_id -> schedules.schedule_id if not exists
    try {
      const existingFkSchedule: any[] = await queryRunner.query(
        `SELECT conname FROM pg_constraint WHERE conname = 'FK_bookings_schedule'`,
      );
      if (!existingFkSchedule || existingFkSchedule.length === 0) {
        await queryRunner.query(
          `ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_schedule" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("schedule_id") ON DELETE CASCADE`,
        );
      }
    } catch (err) {}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_schedule"`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_user"`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_group"`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `ALTER TABLE "session_groups" DROP CONSTRAINT "FK_session_groups_schedule"`,
      );
    } catch (e) {}

    const hasGroupCol = await queryRunner.hasColumn('bookings', 'group_id');
    if (hasGroupCol) {
      await queryRunner.query(`ALTER TABLE "bookings" DROP COLUMN "group_id"`);
    }

    const hasTable = await queryRunner.hasTable('session_groups');
    if (hasTable) {
      await queryRunner.query(`DROP TABLE "session_groups"`);
    }
  }
}
