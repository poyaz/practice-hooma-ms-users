import {UsersModel, UsersRoleEnum} from '../../../../../core/model/users.model';
import {IsDefined, IsEnum, IsNumber, IsString, Matches, Max, MaxLength, Min, MinLength} from 'class-validator';

export class CreateInputDto {
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @Matches(/^[a-zA-Z][a-zA-Z0-9_.-]+$/)
  @IsDefined()
  username: string;

  @IsString()
  @MinLength(5)
  @MaxLength(50)
  @IsDefined()
  password: string;

  @IsEnum(UsersRoleEnum)
  @IsDefined()
  role: UsersRoleEnum;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @IsDefined()
  name: string;

  @IsNumber()
  @Min(18)
  @Max(300)
  @IsDefined()
  age: number;

  static toModel(dto: CreateInputDto): UsersModel {
    const data = UsersModel.getDefaultModel();
    data.username = dto.username;
    data.password = dto.password;
    data.role = dto.role;
    data.name = dto.name;
    data.age = dto.age;

    return data;
  }
}
