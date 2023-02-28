import {Injectable} from '@nestjs/common';
import {AsyncReturn} from '@src-utility/utility';
import {UsersServiceInterface} from '../interface/users-service.interface';
import {UsersModel} from '../model/users.model';
import {GenericRepositoryInterface} from '../interface/generic-repository.interface';
import * as bcrypt from 'bcrypt';
import {UpdateModel} from '@src-utility/model/update.model';
import {NotFoundException} from '../exception/not-found.exception';

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
    const [error, data] = await this._usersRepository.getById(id);
    if (error) {
      return [error];
    }
    if (!data) {
      return [new NotFoundException()];
    }

    return [null, data];
  }

  async create(model: UsersModel): AsyncReturn<Error, UsersModel> {
    const passwordSalt = await bcrypt.genSalt(10);

    const createModel = model.clone();
    createModel.password = await bcrypt.hash(model.password, passwordSalt);
    createModel.salt = passwordSalt;

    return this._usersRepository.create(createModel);
  }

  async update(model: UpdateModel<UsersModel>): AsyncReturn<Error, number> {
    const [userError, userData] = await this.getById(model.id);
    if (userError) {
      return [userError];
    }

    const updateModel = model.getModel();
    if (updateModel.password) {
      updateModel.password = await bcrypt.hash(updateModel.password, userData.salt);
    }

    return this._usersRepository.update(model);
  }

  async delete(id: string): AsyncReturn<Error, number> {
    return Promise.resolve(undefined);
  }
}
