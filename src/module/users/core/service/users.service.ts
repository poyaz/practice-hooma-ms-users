import {Injectable} from '@nestjs/common';
import {AsyncReturn} from '@src-utility/utility';
import {UsersServiceInterface} from '../interface/users-service.interface';
import {UsersModel} from '../model/users.model';
import {GenericRepositoryInterface} from '../interface/generic-repository.interface';
import * as bcrypt from 'bcrypt';
import {UpdateModel} from '@src-utility/model/update.model';

@Injectable()
export class UsersService implements UsersServiceInterface {
  constructor(
    private readonly _usersRepository: GenericRepositoryInterface<UsersModel>,
  ) {
  }

  async getAll<F>(filter?: F): AsyncReturn<Error, Array<UsersModel>> {
    return this._usersRepository.getAll(filter);
  }

  async getById(id: string): AsyncReturn<Error, UsersModel> {
    return Promise.resolve(undefined);
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
}
