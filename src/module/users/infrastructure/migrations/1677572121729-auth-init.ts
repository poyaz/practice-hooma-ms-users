import {MigrationInterface, QueryRunner, Table, TableIndex} from 'typeorm';
import {AUTH_ENTITY_OPTIONS} from '../entity/auth.entity';
import {UsersRoleEnum} from '../../core/model/users.model';

export class authInit1677572121729 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: AUTH_ENTITY_OPTIONS.tableName,
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            primaryKeyConstraintName: AUTH_ENTITY_OPTIONS.primaryKeyName.id,
          },
          {
            name: 'username',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'password',
            type: 'varchar',
            length: '225',
          },
          {
            name: 'salt',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'role',
            type: 'enum',
            enum: Object.values(UsersRoleEnum),
            enumName: AUTH_ENTITY_OPTIONS.enumName.role,
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

    await queryRunner.createIndex(AUTH_ENTITY_OPTIONS.tableName, new TableIndex({
      name: AUTH_ENTITY_OPTIONS.uniqueName.username,
      columnNames: ['username'],
      isUnique: true,
      where: 'delete_at ISNULL',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(AUTH_ENTITY_OPTIONS.tableName, AUTH_ENTITY_OPTIONS.uniqueName.username);
    await queryRunner.dropTable(AUTH_ENTITY_OPTIONS.tableName);
    await queryRunner.query(`DROP TYPE ${AUTH_ENTITY_OPTIONS.enumName.role}`);
  }
}
