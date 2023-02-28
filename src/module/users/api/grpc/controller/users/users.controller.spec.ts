import {Test, TestingModule} from '@nestjs/testing';
import {mock, MockProxy} from 'jest-mock-extended';
import {UsersController} from './users.controller';
import {UsersServiceInterface} from '../../../../core/interface/users-service.interface';
import {ProviderEnum} from '../../../enum/provider.enum';
import {DateTimeInterface} from '../../../../core/interface/date-time.interface';
import {FindAllQueryDto} from './dto/find-all-query.dto';
import {UsersModel, UsersRoleEnum} from '../../../../core/model/users.model';
import {IdentifierInterface} from '../../../../core/interface/identifier.interface';
import {FindAllResponse} from './users.pb';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: MockProxy<UsersServiceInterface>;
  let dateTime: MockProxy<DateTimeInterface>;
  let identifierMock: MockProxy<IdentifierInterface>;
  const defaultDateStr = '2020-01-01';
  const defaultDateTimeStr = `${defaultDateStr} 00:00:00`;
  const defaultDate = new Date(defaultDateStr);

  beforeEach(async () => {
    usersService = mock<UsersServiceInterface>();

    const dateTimeProvider = 'DATE_TIME';
    dateTime = mock<DateTimeInterface>();
    dateTime.gregorianCurrentDateWithTimezone.mockReturnValue(defaultDate);

    identifierMock = mock<IdentifierInterface>();
    identifierMock.generateId.mockReturnValue('11111111-1111-1111-1111-111111111111');

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: ProviderEnum.USERS_SERVICE,
          useValue: usersService,
        },
        {
          provide: dateTimeProvider,
          useValue: dateTime,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe(`findAll`, () => {
    let payload: FindAllQueryDto;
    let outputUsers1: UsersModel;

    beforeEach(() => {
      payload = new FindAllQueryDto();

      outputUsers1 = new UsersModel({
        id: identifierMock.generateId(),
        username: 'username',
        password: 'password',
        salt: 'salt',
        role: UsersRoleEnum.USER,
        name: 'name',
        age: 20,
        createAt: defaultDate,
      });
    });

    it(`Should error find all users`, async () => {
      usersService.getAll.mockResolvedValue([new Error('fail')]);

      let error;
      try {
        await controller.findAll(payload);
      } catch (err) {
        error = err;
      }

      expect(usersService.getAll).toHaveBeenCalled();
      expect(error).toBeInstanceOf(Error);
    });

    it(`Should successfully find all users`, async () => {
      usersService.getAll.mockResolvedValue([null, [outputUsers1], 1]);
      dateTime.gregorianWithTimezoneString.mockReturnValue(defaultDateTimeStr);

      let error;
      let result;
      try {
        result = await controller.findAll(payload);
      } catch (err) {
        error = err;
      }

      expect(usersService.getAll).toHaveBeenCalled();
      expect(dateTime.gregorianWithTimezoneString).toHaveBeenCalledTimes(2);
      expect(error).toBeUndefined();
      expect(result).toMatchObject<FindAllResponse>({
        count: result.count,
        data: [
          {
            id: outputUsers1.id,
            username: outputUsers1.username,
            role: outputUsers1.role,
            name: outputUsers1.name,
            age: outputUsers1.age,
            createAt: defaultDateTimeStr,
            updateAt: defaultDateTimeStr,
          },
        ],
      });
    });
  });
});