import {AsyncReturn} from '@src-utility/utility';
import {UsersModel} from '../model/users.model';
import {UpdateModel} from '@src-utility/model/update.model';

export interface UsersServiceInterface {
  getAll<F>(filter?: F): AsyncReturn<Error, Array<UsersModel>>;

  getById(id: string): AsyncReturn<Error, UsersModel>;

  create(model: UsersModel): AsyncReturn<Error, UsersModel>;

  update(model: UpdateModel<UsersModel>): AsyncReturn<Error, number>;

  delete(id: string): AsyncReturn<Error, number>;
}
