import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn, OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import {Exclude} from 'class-transformer';
import {AuthEntity} from './auth.entity';

const ENTITY_PREFIX = 'users';
export const USERS_ENTITY_OPTIONS = {
  tableName: ENTITY_PREFIX,
  primaryKeyName: {
    id: `${ENTITY_PREFIX}_id_pk`,
  },
};

@Entity({name: USERS_ENTITY_OPTIONS.tableName})
export class UsersEntity extends BaseEntity {
  @PrimaryColumn({type: 'uuid', primaryKeyConstraintName: USERS_ENTITY_OPTIONS.primaryKeyName.id})
  id: string;

  @Column({type: 'varchar', length: 100})
  name: string;

  @Column({type: 'numeric', nullable: true})
  age: number;

  @OneToOne(() => AuthEntity, {createForeignKeyConstraints: false})
  @JoinColumn({
    name: 'id',

  })
  auth: AuthEntity;

  @CreateDateColumn({type: 'timestamp', name: 'create_at'})
  createAt!: Date;

  @UpdateDateColumn({type: 'timestamp', name: 'update_at'})
  updateAt!: Date;

  @Exclude()
  @DeleteDateColumn({type: 'timestamp', name: 'delete_at', nullable: true})
  deleteAt!: Date;
}
