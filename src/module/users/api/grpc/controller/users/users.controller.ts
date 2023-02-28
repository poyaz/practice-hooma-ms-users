import {Controller, Inject} from '@nestjs/common';
import {ProviderEnum} from '../../../enum/provider.enum';
import {UsersServiceInterface} from '../../../../core/interface/users-service.interface';
import {GrpcMethod} from '@nestjs/microservices';
import {CreateRequest, FindAllRequest, FindAllResponse, FindOneResponse, USERS_SERVICE_NAME} from './users.pb';
import {FindAllQueryDto} from './dto/find-all-query.dto';
import {FindAllOutputDto} from './dto/find-all-output.dto';
import {DateTimeInterface} from '../../../../core/interface/date-time.interface';
import {FindOneQueryDto} from './dto/find-one-query.dto';
import {FindOneOutputDto} from './dto/find-one-output.dto';
import {CreateInputDto} from './dto/create-input.dto';

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

  @GrpcMethod(USERS_SERVICE_NAME, 'FindOne')
  async findOne(payload: FindOneQueryDto): Promise<FindOneResponse> {
    const [error, data] = await this._usersService.getById(FindOneQueryDto.toModel(payload));
    if (error) {
      throw error;
    }

    return FindOneOutputDto.toObj(data, this._dateTime);
  }

  @GrpcMethod(USERS_SERVICE_NAME, 'Create')
  async create(payload: CreateInputDto): Promise<FindOneResponse> {
    const [error, data] = await this._usersService.create(CreateInputDto.toModel(payload));
    if (error) {
      throw error;
    }

    return FindOneOutputDto.toObj(data, this._dateTime);
  }
}
