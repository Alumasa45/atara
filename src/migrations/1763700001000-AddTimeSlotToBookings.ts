import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimeSlotToBookings1763700001000 implements MigrationInterface {
  name = 'AddTimeSlotToBookings1763700001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasBookings = await queryRunner.hasTable('bookings');
    if (!hasBookings) {
      return;
    }

    const hasTimeSlotId = await queryRunner.hasColumn(
      'bookings',
      'time_slot_id',
    );
    if (!hasTimeSlotId) {
      try {
        await queryRunner.query(
          `ALTER TABLE "bookings" ADD COLUMN "time_slot_id" integer`,
        );
        console.log('Added time_slot_id column to bookings');
      } catch (e) {
        console.log('time_slot_id column might already exist');
      }

      try {
        const hasTimeSlots = await queryRunner.hasTable('schedule_time_slots');
        if (hasTimeSlots) {
          await queryRunner.query(`
            UPDATE "bookings" b
            SET "time_slot_id" = (
              SELECT "slot_id" FROM "schedule_time_slots" sts
              WHERE sts."schedule_id" = b."schedule_id"
              LIMIT 1
            )
            WHERE "time_slot_id" IS NULL AND "schedule_id" IS NOT NULL
          `);
          console.log('Populated time_slot_id from schedule_time_slots');
        }
      } catch (e) {
        console.log(
          'Could not populate time_slot_id - schedule_time_slots might not exist yet',
        );
      }

      try {
        await queryRunner.query(
          `ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_time_slot" FOREIGN KEY ("time_slot_id") REFERENCES "schedule_time_slots"("slot_id") ON DELETE SET NULL`,
        );
        console.log('Added FK_bookings_time_slot constraint');
      } catch (e) {
        console.log('FK_bookings_time_slot constraint might already exist');
      }

      try {
        await queryRunner.query(
          `CREATE INDEX "IDX_bookings_time_slot_id" ON "bookings" ("time_slot_id")`,
        );
        console.log('Created index on time_slot_id');
      } catch (e) {
        console.log('Index might already exist');
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `DROP INDEX IF EXISTS "IDX_bookings_time_slot_id"`,
      );
    } catch (e) {
      // ignore
    }

    try {
      await queryRunner.query(
        `ALTER TABLE "bookings" DROP CONSTRAINT "FK_bookings_time_slot"`,
      );
    } catch (e) {
      // ignore
    }

    try {
      await queryRunner.query(
        `ALTER TABLE "bookings" DROP COLUMN "time_slot_id"`,
      );
    } catch (e) {
      // ignore
    }
  }
}
