import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSchedulesTable1698750000000 implements MigrationInterface {
  name = 'CreateSchedulesTable1698750000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('schedules');
    if (!has) {
      await queryRunner.query(`
        CREATE TABLE "schedules" (
          "schedule_id" SERIAL PRIMARY KEY,
          "session_id" integer,
          "start_time" TIMESTAMP NOT NULL,
          "end_time" TIMESTAMP NOT NULL,
          "capacity_override" integer,
          "room" varchar(50),
          "status" varchar(20) NOT NULL DEFAULT 'active',
          "created_by" integer,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        );
      `);
    }

    // add FK schedule.session_id -> sessions.session_id if sessions table exists
    try {
      const sessionsExists = await queryRunner.hasTable('sessions');
      if (sessionsExists) {
        await queryRunner.query(
          `ALTER TABLE "schedules" ADD CONSTRAINT "FK_schedules_session" FOREIGN KEY ("session_id") REFERENCES "sessions"("session_id") ON DELETE CASCADE`,
        );
      }
    } catch (e) {
      // ignore
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `ALTER TABLE "schedules" DROP CONSTRAINT "FK_schedules_session"`,
      );
    } catch (e) {}
    const has = await queryRunner.hasTable('schedules');
    if (has) await queryRunner.query(`DROP TABLE "schedules"`);
  }
}
