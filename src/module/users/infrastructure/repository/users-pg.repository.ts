import {GenericRepositoryInterface} from '../../core/interface/generic-repository.interface';
import {UsersModel} from '../../core/model/users.model';
import {AsyncReturn} from '@src-utility/utility';
import {UpdateModel} from '@src-utility/model/update.model';
import {FindManyOptions, Repository} from 'typeorm';
import {AUTH_ENTITY_OPTIONS, AuthEntity} from '../entity/auth.entity';
import {IdentifierInterface} from '../../core/interface/identifier.interface';
import {DateTimeInterface} from '../../core/interface/date-time.interface';
import {UsersEntity} from '../entity/users.entity';
import {SortEnum} from '@src-utility/model/filter.model';
import {RepositoryException} from '../../core/exception/repository.exception';

export class UsersPgRepository implements GenericRepositoryInterface<UsersModel> {
  constructor(
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
    return Promise.resolve(undefined);
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
}
