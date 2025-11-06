import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMembershipTables1701860000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // Create membership_plans table
    await queryRunner.createTable(
      new Table({
        name: 'membership_plans',
        columns: [
          {
            name: 'plan_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'description',
            type: 'varchar',
            length: '255',
          },
          {
            name: 'classes_included',
            type: 'int',
          },
          {
            name: 'duration_days',
            type: 'int',
          },
          {
            name: 'price',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'benefits',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: true,
          },
          {
            name: 'sort_order',
            type: 'int',
            default: 1,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Create membership_subscriptions table
    await queryRunner.createTable(
      new Table({
        name: 'membership_subscriptions',
        columns: [
          {
            name: 'subscription_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'user_id',
            type: 'int',
          },
          {
            name: 'plan_id',
            type: 'int',
          },
          {
            name: 'start_date',
            type: 'date',
          },
          {
            name: 'end_date',
            type: 'date',
          },
          {
            name: 'classes_remaining',
            type: 'int',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '20',
            default: `'active'`,
          },
          {
            name: 'payment_reference',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
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
            columnNames: ['plan_id'],
            referencedTableName: 'membership_plans',
            referencedColumnNames: ['plan_id'],
            onDelete: 'RESTRICT',
          },
        ],
        indices: [
          {
            columnNames: ['user_id'],
          },
          {
            columnNames: ['plan_id'],
          },
        ],
      }),
      true,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('membership_subscriptions', true);
    await queryRunner.dropTable('membership_plans', true);
  }
}
