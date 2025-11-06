import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingsTable1698770000000 implements MigrationInterface {
  name = 'CreateBookingsTable1698770000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('bookings');
    if (!has) {
      await queryRunner.query(`
        CREATE TABLE "bookings" (
          "booking_id" SERIAL PRIMARY KEY,
          "user_id" integer,
          "schedule_id" integer,
          "group_id" integer,
          "guest_name" varchar(100),
          "guest_email" varchar(100),
          "guest_phone" varchar(15),
          "date_booked" TIMESTAMP NOT NULL DEFAULT now(),
          "status" varchar(20) NOT NULL DEFAULT 'booked'
        );
      `);
    }

    // add FK booking.schedule_id -> schedules.schedule_id
    try {
      const schedulesExists = await queryRunner.hasTable('schedules');
      if (schedulesExists) {
        const existingFkSchedule: any[] = await queryRunner.query(
          `SELECT conname FROM pg_constraint WHERE conname = 'FK_bookings_schedule'`,
        );
        if (!existingFkSchedule || existingFkSchedule.length === 0) {
          await queryRunner.query(
            `ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_schedule" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("schedule_id") ON DELETE CASCADE`,
          );
        }
      }
    } catch (e) {}

    // add FK booking.user_id -> users.user_id
    try {
      const usersExists = await queryRunner.hasTable('users');
      if (usersExists) {
        const existingFkUser: any[] = await queryRunner.query(
          `SELECT conname FROM pg_constraint WHERE conname = 'FK_bookings_user'`,
        );
        if (!existingFkUser || existingFkUser.length === 0) {
          await queryRunner.query(
            `ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE SET NULL`,
          );
        }
      }
    } catch (e) {}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_user"`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_schedule"`,
      );
    } catch (e) {}
    const has = await queryRunner.hasTable('bookings');
    if (has) await queryRunner.query(`DROP TABLE "bookings"`);
  }
}
