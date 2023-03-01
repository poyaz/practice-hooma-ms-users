import {GenericRepositoryInterface} from '../../core/interface/generic-repository.interface';
import {UsersModel} from '../../core/model/users.model';
import {AsyncReturn} from '@src-utility/utility';
import {UpdateModel} from '@src-utility/model/update.model';
import {DataSource, FindManyOptions, Repository} from 'typeorm';
import {AUTH_ENTITY_OPTIONS, AuthEntity} from '../entity/auth.entity';
import {IdentifierInterface} from '../../core/interface/identifier.interface';
import {DateTimeInterface} from '../../core/interface/date-time.interface';
import {UsersEntity} from '../entity/users.entity';
import {SortEnum} from '@src-utility/model/filter.model';
import {RepositoryException} from '../../core/exception/repository.exception';
import {QueryRunner} from 'typeorm/query-runner/QueryRunner';

export class UsersPgRepository implements GenericRepositoryInterface<UsersModel> {
  constructor(
    private readonly _dataSource: DataSource,
    private readonly _authDb: Repository<AuthEntity>,
    private readonly _usersDb: Repository<UsersEntity>,
    private readonly _identifier: IdentifierInterface,
    private readonly _date: DateTimeInterface,
  ) {
  }

  async getAll<F>(filter?: F): AsyncReturn<Error, Array<UsersModel>> {
    const findOptions: FindManyOptions<UsersEntity> = {
      relations: [AUTH_ENTITY_OPTIONS.tableName],
      order: {createAt: SortEnum.DESC},
    };

    try {
      const [rows, count] = await this._usersDb.findAndCount(findOptions);
      const result = rows.map((v) => UsersPgRepository._fillModel(v));

      return [null, result, count];
    } catch (error) {
      return [new RepositoryException(error)];
    }
  }

  async getById(id: string): AsyncReturn<Error, UsersModel | null> {
    const findOptions: FindManyOptions<UsersEntity> = {
      relations: [AUTH_ENTITY_OPTIONS.tableName],
      where: {
        id,
      },
      order: {createAt: SortEnum.DESC},
    };

    try {
      const row = await this._usersDb.findOne(findOptions);
      if (!row) {
        return [null, null];
      }

      const result = UsersPgRepository._fillModel(row);

      return [null, result];
    } catch (error) {
      return [new RepositoryException(error)];
    }
  }

  async create(model: UsersModel): AsyncReturn<Error, UsersModel> {
    const id = this._identifier.generateId();

    const authEntity = new AuthEntity();
    authEntity.id = id;
    authEntity.username = model.username;
    authEntity.password = model.password;
    authEntity.salt = model.salt;
    authEntity.role = model.role;

    const usersEntity = new UsersEntity();
    usersEntity.id = id;
    usersEntity.name = model.name;
    usersEntity.age = model.age;

    const txOption = {isConnect: false, isTxStart: false};
    const queryRunner = this._dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      txOption.isConnect = true;

      await queryRunner.startTransaction();
      txOption.isTxStart = true;

      const authRow = await queryRunner.manager.save(authEntity);
      const usersRow = await queryRunner.manager.save(usersEntity);

      await queryRunner.commitTransaction();

      usersRow.auth = authRow;
      const result = UsersPgRepository._fillModel(usersRow);

      return [null, result];
    } catch (error) {
      const repositoryError = new RepositoryException(error);
      const [rollbackError] = await this._rollbackExecute(repositoryError, queryRunner, txOption.isTxStart);

      return [rollbackError];
    } finally {
      if (txOption.isConnect) {
        await queryRunner.release();
      }
    }
  }

  async update(model: UpdateModel<UsersModel>): AsyncReturn<Error, number> {
    return Promise.resolve(undefined);
  }

  async delete(id: string): AsyncReturn<Error, number> {
    return Promise.resolve(undefined);
  }

  private static _fillModel(entity: UsersEntity) {
    return new UsersModel({
      id: entity.id,
      username: entity.auth.username,
      password: entity.auth.password,
      salt: entity.auth.salt,
      role: entity.auth.role,
      name: entity.name,
      age: entity.age,
      createAt: entity.createAt,
      updateAt: entity.updateAt,
    });
  }

  private async _rollbackExecute(executeError: RepositoryException, queryRunner: QueryRunner, isTxStart: boolean): AsyncReturn<RepositoryException, null> {
    if (!isTxStart) {
      return [executeError];
    }

    try {
      await queryRunner.rollbackTransaction();

      return [executeError];
    } catch (error) {
      return [new RepositoryException(error, executeError)];
    }
  }
}
