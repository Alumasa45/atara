import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentReferenceToBookings1762300000000
  implements MigrationInterface
{
  name = 'AddPaymentReferenceToBookings1762300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasColumn('bookings', 'payment_reference');
    if (!has) {
      await queryRunner.query(
        `ALTER TABLE "bookings" ADD COLUMN "payment_reference" varchar(100)`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `ALTER TABLE "bookings" DROP COLUMN "payment_reference"`,
      );
    } catch (e) {}
  }
}
