import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfilesTable1762100000000 implements MigrationInterface {
  name = 'CreateProfilesTable1762100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('profiles');
    if (!has) {
      await queryRunner.query(`
        CREATE TABLE "profiles" (
          "id" SERIAL PRIMARY KEY,
          "user_id" integer UNIQUE,
          "points" integer NOT NULL DEFAULT 0,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        );
      `);
    }

    // add FK to users
    try {
      await queryRunner.query(
        `ALTER TABLE "profiles" ADD CONSTRAINT "FK_profiles_user" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE`,
      );
    } catch (e) {}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `ALTER TABLE "profiles" DROP CONSTRAINT "FK_profiles_user"`,
      );
    } catch (e) {}
    const has = await queryRunner.hasTable('profiles');
    if (has) await queryRunner.query(`DROP TABLE "profiles"`);
  }
}
