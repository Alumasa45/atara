import { MigrationInterface, QueryRunner } from 'typeorm';

export class RefactorSchedulesToTimeSlots1763700000000
  implements MigrationInterface
{
  name = 'RefactorSchedulesToTimeSlots1763700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if schedules table exists
    const hasSchedules = await queryRunner.hasTable('schedules');

    if (!hasSchedules) {
      // If schedules doesn't exist, create it with new structure
      await queryRunner.query(`
        CREATE TABLE "schedules" (
          "schedule_id" SERIAL PRIMARY KEY,
          "date" DATE NOT NULL,
          "status" varchar(20) NOT NULL DEFAULT 'active',
          "created_by" integer,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        );
      `);

      // Create users FK
      try {
        const usersExists = await queryRunner.hasTable('users');
        if (usersExists) {
          await queryRunner.query(
            `ALTER TABLE "schedules" ADD CONSTRAINT "FK_schedules_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("user_id") ON DELETE SET NULL`,
          );
        }
      } catch (e) {
        console.log('Note: Could not add FK to users');
      }
    } else {
      // Migrate existing schedules table
      // Check what columns currently exist
      const columnInfo = await queryRunner.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_name = 'schedules'
      `);
      const hasStartTime = columnInfo.some(
        (col: any) => col.column_name === 'start_time',
      );
      const hasDate = columnInfo.some((col: any) => col.column_name === 'date');

      if (hasStartTime) {
        // Migration needed - handle constraints and columns

        // Drop old junction table if it exists
        const hasJunction = await queryRunner.hasTable('schedule_sessions');
        if (hasJunction) {
          try {
            await queryRunner.query(`DROP TABLE "schedule_sessions" CASCADE`);
          } catch (e) {
            console.log('Note: Could not drop schedule_sessions table');
          }
        }

        // Try to drop old FK (use conditional syntax)
        try {
          const constraintCheck = await queryRunner.query(`
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_name = 'schedules' AND constraint_name = 'FK_schedules_session'
          `);
          if (constraintCheck.length > 0) {
            await queryRunner.query(
              `ALTER TABLE "schedules" DROP CONSTRAINT "FK_schedules_session"`,
            );
          }
        } catch (e) {
          console.log(
            'Note: FK_schedules_session already dropped or does not exist',
          );
        }

        // Drop old columns - each in its own try/catch
        const columnsToDropList = [
          'session_id',
          'start_time',
          'end_time',
          'capacity_override',
          'room',
        ];
        for (const col of columnsToDropList) {
          try {
            const colExists = columnInfo.some(
              (c: any) => c.column_name === col,
            );
            if (colExists) {
              await queryRunner.query(
                `ALTER TABLE "schedules" DROP COLUMN "${col}"`,
              );
            }
          } catch (e) {
            console.log(`Note: Could not drop column ${col}`);
          }
        }

        // Add date column if it doesn't exist
        if (!hasDate) {
          try {
            await queryRunner.query(
              `ALTER TABLE "schedules" ADD COLUMN "date" DATE NOT NULL DEFAULT CURRENT_DATE`,
            );
          } catch (e) {
            console.log('Note: date column might already exist');
          }
        }
      }
    }

    // Create schedule_time_slots table
    const hasTimeSlots = await queryRunner.hasTable('schedule_time_slots');
    if (!hasTimeSlots) {
      await queryRunner.query(`
        CREATE TABLE "schedule_time_slots" (
          "slot_id" SERIAL PRIMARY KEY,
          "schedule_id" integer NOT NULL,
          "session_id" integer NOT NULL,
          "start_time" TIME NOT NULL,
          "end_time" TIME NOT NULL,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        );
      `);

      // Add FKs for time slots
      try {
        await queryRunner.query(
          `ALTER TABLE "schedule_time_slots" ADD CONSTRAINT "FK_time_slots_schedule" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("schedule_id") ON DELETE CASCADE`,
        );
      } catch (e) {
        console.log(
          'Note: FK_time_slots_schedule already exists or could not be created',
        );
      }

      try {
        const sessionsExists = await queryRunner.hasTable('sessions');
        if (sessionsExists) {
          await queryRunner.query(
            `ALTER TABLE "schedule_time_slots" ADD CONSTRAINT "FK_time_slots_session" FOREIGN KEY ("session_id") REFERENCES "sessions"("session_id") ON DELETE RESTRICT`,
          );
        }
      } catch (e) {
        console.log(
          'Note: FK_time_slots_session already exists or could not be created',
        );
      }

      // Create index on schedule_id for performance
      try {
        await queryRunner.query(
          `CREATE INDEX "IDX_time_slots_schedule_id" ON "schedule_time_slots" ("schedule_id")`,
        );
      } catch (e) {
        console.log('Note: Index might already exist');
      }
    }

    // Add time_slot_id to bookings if it doesn't exist
    const bookingsHasTimeSlotId = await queryRunner.hasColumn(
      'bookings',
      'time_slot_id',
    );
    if (!bookingsHasTimeSlotId) {
      try {
        await queryRunner.query(
          `ALTER TABLE "bookings" ADD COLUMN "time_slot_id" integer`,
        );
      } catch (e) {
        console.log('Note: time_slot_id column might already exist');
      }

      try {
        await queryRunner.query(
          `ALTER TABLE "bookings" ADD CONSTRAINT "FK_bookings_time_slot" FOREIGN KEY ("time_slot_id") REFERENCES "schedule_time_slots"("slot_id") ON DELETE SET NULL`,
        );
      } catch (e) {
        console.log('Note: FK_bookings_time_slot might already exist');
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop schedule_time_slots table
    try {
      await queryRunner.query(`DROP TABLE "schedule_time_slots"`);
    } catch (e) {
      // ignore
    }

    // Restore schedules table to original structure
    try {
      const hasSchedules = await queryRunner.hasTable('schedules');
      if (hasSchedules) {
        // Drop date column
        await queryRunner.query(
          `ALTER TABLE "schedules" DROP COLUMN IF EXISTS "date"`,
        );

        // Add old columns back
        await queryRunner.query(
          `ALTER TABLE "schedules" ADD COLUMN "session_id" integer`,
        );
        await queryRunner.query(
          `ALTER TABLE "schedules" ADD COLUMN "start_time" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(
          `ALTER TABLE "schedules" ADD COLUMN "end_time" TIMESTAMP NOT NULL DEFAULT now()`,
        );
        await queryRunner.query(
          `ALTER TABLE "schedules" ADD COLUMN "capacity_override" integer`,
        );
        await queryRunner.query(
          `ALTER TABLE "schedules" ADD COLUMN "room" varchar(50)`,
        );

        // Recreate junction table
        const hasJunction = await queryRunner.hasTable('schedule_sessions');
        if (!hasJunction) {
          await queryRunner.query(`
            CREATE TABLE "schedule_sessions" (
              "schedule_id" integer NOT NULL,
              "session_id" integer NOT NULL,
              PRIMARY KEY ("schedule_id", "session_id")
            );
          `);
        }
      }
    } catch (e) {
      // ignore
    }
  }
}
