import {MigrationInterface, QueryRunner, Table} from 'typeorm';
import {USERS_ENTITY_OPTIONS} from '../entity/users.entity';

export class usersInit1677651806404 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: USERS_ENTITY_OPTIONS.tableName,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            primaryKeyConstraintName: USERS_ENTITY_OPTIONS.primaryKeyName.id,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'age',
            type: 'numeric',
            isNullable: true,
          },
          {
            name: 'create_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'update_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'delete_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable(USERS_ENTITY_OPTIONS.tableName);
  }
}
