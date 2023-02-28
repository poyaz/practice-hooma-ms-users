import {UsersModel} from '../../../../../core/model/users.model';
import {FindAllRequest} from '../users.pb';
import {FilterModel} from '@src-utility/model/filter.model';

export class FindAllQueryDto {
  static toModel(dto: FindAllQueryDto): FilterModel<UsersModel> {
    return new FilterModel<UsersModel>();
  }
}
