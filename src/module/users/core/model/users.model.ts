import {BaseModel, ModelRequireProp} from '@src-utility/model/baseModel';
import {defaultModelFactory} from '@src-utility/model/defaultModelFactory';
import {DefaultPropertiesSymbol, IsDefaultSymbol} from '@src-utility/model/symbol';

export enum UsersRoleEnum {
  ADMIN = 'admin',
  USER = 'user',
}

export class UsersModel extends BaseModel<UsersModel> {
  id: string;
  username: string;
  password: string;
  salt: string;
  role: UsersRoleEnum;
  name: string;
  age?: number;
  createAt: Date;
  updateAt?: Date;

  constructor(props: ModelRequireProp<UsersModel>) {
    super();

    Object.assign(this, props);
  }

  static getDefaultModel(): UsersModel {
    return defaultModelFactory<UsersModel>(new UsersModel({
      id: 'default-id',
      username: 'default-username',
      password: 'default-password',
      salt: 'default-salt',
      role: UsersRoleEnum.USER,
      name: 'default-name',
      createAt: new Date(),
      [IsDefaultSymbol]: true,
      [DefaultPropertiesSymbol]: ['id', 'username', 'password', 'salt', 'role', 'name', 'createAt'],
    }));
  }
}
