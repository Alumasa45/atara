import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddTrainerUserForeignKey1698890000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tableName = 'trainers';
    const columnName = 'user_id';

    const hasColumn = await queryRunner.hasColumn(tableName, columnName);
    if (!hasColumn) {
      await queryRunner.addColumn(
        tableName,
        new TableColumn({
          name: columnName,
          type: 'int',
          isNullable: false,
        }),
      );
    }

    const table = await queryRunner.getTable(tableName);
    if (table) {
      const hasForeignKey = table.foreignKeys.some(
        (fk) => fk.columnNames.length === 1 && fk.columnNames[0] === columnName,
      );
      if (!hasForeignKey) {
        await queryRunner.createForeignKey(
          tableName,
          new TableForeignKey({
            columnNames: [columnName],
            referencedTableName: 'users',
            referencedColumnNames: ['user_id'],
            onDelete: 'CASCADE',
          }),
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tableName = 'trainers';
    const columnName = 'user_id';

    const table = await queryRunner.getTable(tableName);
    if (table) {
      const fk = table.foreignKeys.find(
        (f) => f.columnNames.length === 1 && f.columnNames[0] === columnName,
      );
      if (fk) {
        await queryRunner.dropForeignKey(tableName, fk);
      }

      const hasColumn = table.columns.some((c) => c.name === columnName);
      if (hasColumn) {
        await queryRunner.dropColumn(tableName, columnName);
      }
    }
  }
}
