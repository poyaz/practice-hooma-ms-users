import {UsersModel} from '../../../../../core/model/users.model';
import {FindOneResponse} from '../users.pb';
import {DateTimeInterface} from '../../../../../core/interface/date-time.interface';

export class FindOneOutputDto {
  static toObj(model: UsersModel, dateTime: DateTimeInterface): FindOneResponse {
    return {
      id: model.id,
      username: model.username,
      role: model.role,
      name: model.name,
      age: model.age,
      createAt: dateTime.gregorianWithTimezoneString(model.createAt),
      updateAt: dateTime.gregorianWithTimezoneString(model.updateAt || model.createAt),
    };
  }
}
