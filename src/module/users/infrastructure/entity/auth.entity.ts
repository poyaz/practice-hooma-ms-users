import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity, Index,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import {Exclude} from 'class-transformer';
import {UsersRoleEnum} from '../../core/model/users.model';

const ENTITY_PREFIX = 'auth';
export const AUTH_ENTITY_OPTIONS = {
  tableName: ENTITY_PREFIX,
  primaryKeyName: {
    id: `${ENTITY_PREFIX}_id_pk`,
  },
  uniqueName: {
    username: `${ENTITY_PREFIX}_username_unique_idx`,
  },
  enumName: {
    role: `${ENTITY_PREFIX}_role_enum`,
  },
};

@Entity({name: AUTH_ENTITY_OPTIONS.tableName})
export class AuthEntity extends BaseEntity {
  @PrimaryColumn({type: 'uuid', primaryKeyConstraintName: AUTH_ENTITY_OPTIONS.primaryKeyName.id})
  id: string;

  @Column({type: 'varchar', length: 100})
  @Index(AUTH_ENTITY_OPTIONS.uniqueName.username, {unique: true, where: 'delete_at ISNULL'})
  username: string;

  @Column({type: 'varchar', length: 225})
  password: string;

  @Column({type: 'varchar', length: 100})
  salt: string;

  @Column({
    type: 'enum',
    enum: UsersRoleEnum,
    enumName: AUTH_ENTITY_OPTIONS.enumName.role,
  })
  role: UsersRoleEnum;

  @CreateDateColumn({type: 'timestamp', name: 'create_at'})
  createAt!: Date;

  @UpdateDateColumn({type: 'timestamp', name: 'update_at'})
  updateAt!: Date;

  @Exclude()
  @DeleteDateColumn({type: 'timestamp', name: 'delete_at', nullable: true})
  deleteAt!: Date;
}

