import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateNotificationsTable1764100000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          {
            name: 'notification_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'type',
            type: 'enum',
            enum: ['new_booking', 'booking_cancelled', 'payment_received'],
            isNullable: false,
          },
          {
            name: 'title',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'message',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'booking_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'is_read',
            type: 'boolean',
            default: false,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
        foreignKeys: [
          {
            columnNames: ['user_id'],
            referencedTableName: 'users',
            referencedColumnNames: ['user_id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['booking_id'],
            referencedTableName: 'bookings',
            referencedColumnNames: ['booking_id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Create indexes for better performance
    await queryRunner.createIndex(
      'notifications',
      { name: 'IDX_notifications_user_id', columnNames: ['user_id'] },
    );

    await queryRunner.createIndex(
      'notifications',
      { name: 'IDX_notifications_is_read', columnNames: ['is_read'] },
    );

    await queryRunner.createIndex(
      'notifications',
      { name: 'IDX_notifications_created_at', columnNames: ['created_at'] },
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
  }
}