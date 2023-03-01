import {UsersModel, UsersRoleEnum} from '../../../../../core/model/users.model';
import {FindAllRequest} from '../users.pb';
import {FilterModel} from '@src-utility/model/filter.model';
import {IsEnum, IsOptional, IsString} from 'class-validator';

export class FindAllQueryDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  role?: UsersRoleEnum;

  @IsString()
  @IsOptional()
  name?: string;

  static toModel(dto: FindAllQueryDto): FilterModel<UsersModel> {
    return new FilterModel<UsersModel>();
  }
}
