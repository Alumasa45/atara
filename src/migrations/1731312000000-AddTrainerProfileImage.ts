import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrainerProfileImage1731312000000 implements MigrationInterface {
  name = 'AddTrainerProfileImage1731312000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "trainers" ADD "profile_image" character varying(255)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "trainers" DROP COLUMN "profile_image"`);
  }
}