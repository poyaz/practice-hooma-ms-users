import { MigrationInterface, QueryRunner } from "typeorm"
import {UsersRoleEnum} from '../../core/model/users.model';
import {USERS_ENTITY_OPTIONS} from '../entity/users.entity';

export class addDefaultAdminUsers1677652223501 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO ${USERS_ENTITY_OPTIONS.tableName} (id, name)
            VALUES ('9e9f7320-d23d-4688-96c4-d92f76cac6cd', 'admin')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.query(`DELETE
                             FROM ${USERS_ENTITY_OPTIONS.tableName}
                             WHERE id = '9e9f7320-d23d-4688-96c4-d92f76cac6cd'`);
    }
}
