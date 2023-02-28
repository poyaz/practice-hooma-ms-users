import {AsyncReturn} from '@src-utility/utility';
import {UpdateModel} from '@src-utility/model/update.model';

export interface GenericRepositoryInterface<T> {
  getAll<F>(filter?: F): AsyncReturn<Error, Array<T>>;

  getById(id: string): AsyncReturn<Error, T | null>;

  create(model: T): AsyncReturn<Error, T>;

  update(model: UpdateModel<T>): AsyncReturn<Error, number>;

  delete(id: string): AsyncReturn<Error, number>;
}
