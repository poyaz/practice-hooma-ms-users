import {UsersModel} from '../../../../../core/model/users.model';
import {FindOneResponse} from '../users.pb';
import {FindOneOutputDto} from './find-one-output.dto';
import {DateTimeInterface} from '../../../../../core/interface/date-time.interface';

export class FindAllOutputDto {
  static toObj(models: Array<UsersModel>, dateTime: DateTimeInterface): Array<FindOneResponse> {
    return models.map((v) => FindOneOutputDto.toObj(v, dateTime));
  }
}
