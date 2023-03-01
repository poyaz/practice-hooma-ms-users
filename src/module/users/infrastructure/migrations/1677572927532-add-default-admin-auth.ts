import {MigrationInterface, QueryRunner} from 'typeorm';
import {AUTH_ENTITY_OPTIONS} from '../entity/auth.entity';
import {UsersRoleEnum} from '../../core/model/users.model';

export class addDefaultAdminAuth1677572927532 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        INSERT INTO ${AUTH_ENTITY_OPTIONS.tableName} (id, username, password, salt, role)
        VALUES ('9e9f7320-d23d-4688-96c4-d92f76cac6cd',
                'admin',
                '$2b$10$cLOaRG6x3bnI4USySK.VpOBDExg0RtRUR2mRQ6z5PmcroaZsSKJhm',
                '$2b$10$cLOaRG6x3bnI4USySK.VpO',
                '${UsersRoleEnum.ADMIN}')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE
                             FROM ${AUTH_ENTITY_OPTIONS.tableName}
                             WHERE id = '9e9f7320-d23d-4688-96c4-d92f76cac6cd'`);
  }
}
