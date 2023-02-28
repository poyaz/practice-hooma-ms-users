import {Controller, Inject} from '@nestjs/common';
import {ProviderEnum} from '../../../enum/provider.enum';
import {UsersServiceInterface} from '../../../../core/interface/users-service.interface';
import {GrpcMethod} from '@nestjs/microservices';
import {FindAllRequest, FindAllResponse, USERS_SERVICE_NAME} from './users.pb';
import {FindAllQueryDto} from './dto/find-all-query.dto';
import {FindAllOutputDto} from './dto/find-all-output.dto';
import {DateTimeInterface} from '../../../../core/interface/date-time.interface';

@Controller()
export class UsersController {
  constructor(
    @Inject(ProviderEnum.USERS_SERVICE)
    private readonly _usersService: UsersServiceInterface,
    @Inject(ProviderEnum.DATE_TIME)
    private readonly _dateTime: DateTimeInterface,
  ) {
  }

  @GrpcMethod(USERS_SERVICE_NAME, 'FindAll')
  async findAll(payload: FindAllQueryDto): Promise<FindAllResponse> {
    const [error, data, count] = await this._usersService.getAll(FindAllQueryDto.toModel(payload));
    if (error) {
      throw error;
    }

    return {count, data: FindAllOutputDto.toObj(data, this._dateTime)};
  }
}
