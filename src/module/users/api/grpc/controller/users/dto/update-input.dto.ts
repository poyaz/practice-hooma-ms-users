import {
  IsOptional,
  IsDefined,
  IsEnum,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  IsUUID,
} from 'class-validator';
import {UsersModel, UsersRoleEnum} from '../../../../../core/model/users.model';
import {UpdateModel} from '@src-utility/model/update.model';

export class UpdateInputDto {
  @IsUUID()
  @IsDefined()
  userId: string;

  @IsString()
  @MinLength(5)
  @MaxLength(50)
  @IsOptional()
  password?: string;

  @IsEnum(UsersRoleEnum)
  @IsOptional()
  role?: UsersRoleEnum;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(18)
  @Max(300)
  @IsOptional()
  age?: number;

  static toModel(dto: UpdateInputDto): UpdateModel<UsersModel> {
    return new UpdateModel<UsersModel>(dto.userId, {
      password: dto.password,
      role: dto.role,
      name: dto.name,
      age: dto.age,
    });
  }
}
