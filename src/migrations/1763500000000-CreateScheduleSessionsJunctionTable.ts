import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateScheduleSessionsJunctionTable1763500000000
  implements MigrationInterface
{
  name = 'CreateScheduleSessionsJunctionTable1763500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the junction table for many-to-many relationship
    const hasJunctionTable = await queryRunner.hasTable('schedule_sessions');
    if (!hasJunctionTable) {
      await queryRunner.query(`
        CREATE TABLE "schedule_sessions" (
          "schedule_id" integer NOT NULL,
          "session_id" integer NOT NULL,
          PRIMARY KEY ("schedule_id", "session_id")
        );
      `);

      // Add foreign keys
      await queryRunner.query(`
        ALTER TABLE "schedule_sessions" 
        ADD CONSTRAINT "FK_schedule_sessions_schedule" 
        FOREIGN KEY ("schedule_id") 
        REFERENCES "schedules"("schedule_id") 
        ON DELETE CASCADE;
      `);

      await queryRunner.query(`
        ALTER TABLE "schedule_sessions" 
        ADD CONSTRAINT "FK_schedule_sessions_session" 
        FOREIGN KEY ("session_id") 
        REFERENCES "sessions"("session_id") 
        ON DELETE CASCADE;
      `);
    }

    // Migrate data from old session_id column to junction table
    // Check if session_id column exists
    const table = await queryRunner.getTable('schedules');
    const sessionIdColumn = table?.columns.find(
      (col) => col.name === 'session_id',
    );

    if (sessionIdColumn) {
      // Insert existing session_id values into junction table
      await queryRunner.query(`
        INSERT INTO "schedule_sessions" ("schedule_id", "session_id")
        SELECT "schedule_id", "session_id" 
        FROM "schedules" 
        WHERE "session_id" IS NOT NULL;
      `);

      // Drop the old foreign key if it exists
      try {
        await queryRunner.query(
          `ALTER TABLE "schedules" DROP CONSTRAINT "FK_schedules_session"`,
        );
      } catch (e) {
        // Ignore if constraint doesn't exist
      }

      // Drop the old session_id column
      await queryRunner.query(`
        ALTER TABLE "schedules" DROP COLUMN "session_id";
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the junction table
    const hasJunctionTable = await queryRunner.hasTable('schedule_sessions');
    if (hasJunctionTable) {
      await queryRunner.query(`DROP TABLE "schedule_sessions"`);
    }

    // Re-add the session_id column
    const hasSessionIdColumn = (
      await queryRunner.getTable('schedules')
    )?.columns.find((col) => col.name === 'session_id');
    if (!hasSessionIdColumn) {
      await queryRunner.query(`
        ALTER TABLE "schedules" ADD COLUMN "session_id" integer;
      `);

      // Re-add the foreign key constraint
      try {
        await queryRunner.query(
          `ALTER TABLE "schedules" ADD CONSTRAINT "FK_schedules_session" FOREIGN KEY ("session_id") REFERENCES "sessions"("session_id") ON DELETE CASCADE`,
        );
      } catch (e) {
        // Ignore if constraint already exists
      }
    }
  }
}
