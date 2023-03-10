import {GenericRepositoryInterface} from '../../core/interface/generic-repository.interface';
import {UsersModel, UsersRoleEnum} from '../../core/model/users.model';
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
import {DeleteReadonlyResourceException} from '../../core/exception/delete-readonly-resource.exception';
import {UpdateReadonlyResourceException} from '../../core/exception/update-readonly-resource.exception';

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
    const updateUserModel = model.getModel();

    const [findError, findData] = await this._findOneAuthAndUsers(model.id);
    if (findError) {
      return [findError];
    }

    const {authRow, usersRow} = findData;
    if (!(authRow && usersRow)) {
      return [null, 0];
    }

    if (
      authRow.username === 'admin'
      && authRow.role === UsersRoleEnum.ADMIN
      && typeof updateUserModel.role !== 'undefined'
      && updateUserModel.role !== UsersRoleEnum.ADMIN
    ) {
      return [new UpdateReadonlyResourceException()];
    }

    const txOption = {isConnect: false, isTxStart: false};
    const updateState = {shouldUpdateAuth: false, shouldUpdateUser: false};
    const queryRunner = this._dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      txOption.isConnect = true;

      await queryRunner.startTransaction();
      txOption.isTxStart = true;

      if (typeof updateUserModel.password !== 'undefined') {
        authRow.password = updateUserModel.password;
        updateState.shouldUpdateAuth = true;
      }
      if (typeof updateUserModel.role !== 'undefined') {
        authRow.role = updateUserModel.role;
        updateState.shouldUpdateAuth = true;
      }
      if (typeof updateUserModel.name !== 'undefined') {
        usersRow.name = updateUserModel.name;
        updateState.shouldUpdateUser = true;
      }
      if (typeof updateUserModel.age !== 'undefined') {
        usersRow.age = updateUserModel.age;
        updateState.shouldUpdateUser = true;
      }

      let updateCount = 0;
      if (updateState.shouldUpdateAuth) {
        await queryRunner.manager.save(authRow);
        updateCount = 1;
      }
      if (updateState.shouldUpdateUser) {
        await queryRunner.manager.save(usersRow);
        updateCount = 1;
      }

      await queryRunner.commitTransaction();

      return [null, updateCount];
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

  async delete(id: string): AsyncReturn<Error, number> {
    const [findError, findData] = await this._findOneAuthAndUsers(id);
    if (findError) {
      return [findError];
    }

    const {authRow, usersRow} = findData;
    if (!(authRow && usersRow)) {
      return [null, 0];
    }

    if (authRow.username === 'admin' && authRow.role === UsersRoleEnum.ADMIN) {
      return [new DeleteReadonlyResourceException()];
    }

    const txOption = {isConnect: false, isTxStart: false};
    const queryRunner = this._dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      txOption.isConnect = true;

      await queryRunner.startTransaction();
      txOption.isTxStart = true;

      await queryRunner.manager.softDelete(AuthEntity, id);
      await queryRunner.manager.softDelete(UsersEntity, id);

      await queryRunner.commitTransaction();

      return [null, 1];
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

  private async _findOneAuthAndUsers(id: string): AsyncReturn<Error, { authRow: AuthEntity, usersRow: UsersEntity }> {
    try {
      const [authRow, usersRow] = await Promise.all([
        this._authDb.findOneBy({id}),
        this._usersDb.findOneBy({id}),
      ]);

      return [null, {authRow, usersRow}];
    } catch (error) {
      return [new RepositoryException(error)];
    }
  }
}
