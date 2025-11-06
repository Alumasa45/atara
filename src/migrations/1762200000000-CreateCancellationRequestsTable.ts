import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCancellationRequestsTable1762200000000
  implements MigrationInterface
{
  name = 'CreateCancellationRequestsTable1762200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const has = await queryRunner.hasTable('cancellation_requests');
    if (!has) {
      await queryRunner.query(`
        CREATE TABLE "cancellation_requests" (
          "id" SERIAL PRIMARY KEY,
          "booking_id" integer,
          "requester_id" integer,
          "message" text,
          "status" varchar(20) NOT NULL DEFAULT 'pending',
          "approver_id" integer,
          "created_at" TIMESTAMP NOT NULL DEFAULT now(),
          "updated_at" TIMESTAMP NOT NULL DEFAULT now()
        );
      `);
    }

    try {
      await queryRunner.query(
        `ALTER TABLE "cancellation_requests" ADD CONSTRAINT "FK_cancelreq_booking" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE CASCADE`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `ALTER TABLE "cancellation_requests" ADD CONSTRAINT "FK_cancelreq_requester" FOREIGN KEY ("requester_id") REFERENCES "users"("user_id") ON DELETE SET NULL`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `ALTER TABLE "cancellation_requests" ADD CONSTRAINT "FK_cancelreq_approver" FOREIGN KEY ("approver_id") REFERENCES "users"("user_id") ON DELETE SET NULL`,
      );
    } catch (e) {}
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    try {
      await queryRunner.query(
        `ALTER TABLE "cancellation_requests" DROP CONSTRAINT "FK_cancelreq_approver"`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `ALTER TABLE "cancellation_requests" DROP CONSTRAINT "FK_cancelreq_requester"`,
      );
    } catch (e) {}
    try {
      await queryRunner.query(
        `ALTER TABLE "cancellation_requests" DROP CONSTRAINT "FK_cancelreq_booking"`,
      );
    } catch (e) {}
    const has = await queryRunner.hasTable('cancellation_requests');
    if (has) await queryRunner.query(`DROP TABLE "cancellation_requests"`);
  }
}
