import {Test, TestingModule} from '@nestjs/testing';
import {mock, MockProxy} from 'jest-mock-extended';
import {UsersController} from './users.controller';
import {UsersServiceInterface} from '../../../../core/interface/users-service.interface';
import {ProviderEnum} from '../../../enum/provider.enum';
import {DateTimeInterface} from '../../../../core/interface/date-time.interface';
import {FindAllQueryDto} from './dto/find-all-query.dto';
import {UsersModel, UsersRoleEnum} from '../../../../core/model/users.model';
import {IdentifierInterface} from '../../../../core/interface/identifier.interface';
import {FindAllResponse, FindOneResponse, UpdateAndDeleteResponse} from './users.pb';
import {FindOneQueryDto} from './dto/find-one-query.dto';
import {CreateInputDto} from './dto/create-input.dto';
import {UpdateInputDto} from './dto/update-input.dto';
import {UpdateModel} from '@src-utility/model/update.model';

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

    jest.useFakeTimers().setSystemTime(defaultDate);
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

  describe(`findOne`, () => {
    let payload: FindOneQueryDto;
    let outputUsers: UsersModel;

    beforeEach(() => {
      payload = new FindOneQueryDto();
      payload.userId = identifierMock.generateId();

      outputUsers = new UsersModel({
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

    it(`Should error find one user`, async () => {
      usersService.getById.mockResolvedValue([new Error('fail')]);

      let error;
      try {
        await controller.findOne(payload);
      } catch (err) {
        error = err;
      }

      expect(usersService.getById).toHaveBeenCalled();
      expect(usersService.getById).toHaveBeenCalledWith(identifierMock.generateId());
      expect(error).toBeInstanceOf(Error);
    });

    it(`Should successfully find one user`, async () => {
      usersService.getById.mockResolvedValue([null, outputUsers]);
      dateTime.gregorianWithTimezoneString.mockReturnValue(defaultDateTimeStr);

      let error;
      let result;
      try {
        result = await controller.findOne(payload);
      } catch (err) {
        error = err;
      }

      expect(usersService.getById).toHaveBeenCalled();
      expect(usersService.getById).toHaveBeenCalledWith(identifierMock.generateId());
      expect(dateTime.gregorianWithTimezoneString).toHaveBeenCalledTimes(2);
      expect(error).toBeUndefined();
      expect(result).toMatchObject<FindOneResponse>({
        id: outputUsers.id,
        username: outputUsers.username,
        role: outputUsers.role,
        name: outputUsers.name,
        age: outputUsers.age,
        createAt: defaultDateTimeStr,
        updateAt: defaultDateTimeStr,
      });
    });
  });

  describe(`create`, () => {
    let payload: CreateInputDto;
    let matchUsers: UsersModel;
    let outputUsers: UsersModel;

    beforeEach(() => {
      payload = new CreateInputDto();
      payload.username = 'username';
      payload.password = 'password';
      payload.role = UsersRoleEnum.USER;
      payload.name = 'name';
      payload.age = 20;

      matchUsers = UsersModel.getDefaultModel();
      matchUsers.username = payload.username;
      matchUsers.password = payload.password;
      matchUsers.role = payload.role;
      matchUsers.name = payload.name;
      matchUsers.age = payload.age;

      outputUsers = new UsersModel({
        id: identifierMock.generateId(),
        username: payload.username,
        password: payload.password,
        salt: 'salt',
        role: payload.role,
        name: payload.name,
        age: payload.age,
        createAt: defaultDate,
      });
    });

    it(`Should error create user`, async () => {
      usersService.create.mockResolvedValue([new Error('fail')]);

      let error;
      try {
        await controller.create(payload);
      } catch (err) {
        error = err;
      }

      expect(usersService.create).toHaveBeenCalled();
      expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining<Pick<UsersModel, 'username' | 'password' | 'role' | 'name' | 'age'>>({
        username: payload.username,
        password: payload.password,
        role: payload.role,
        name: payload.name,
        age: payload.age,
      }));
      expect(error).toBeInstanceOf(Error);
    });

    it(`Should successfully create user`, async () => {
      usersService.create.mockResolvedValue([null, outputUsers]);
      dateTime.gregorianWithTimezoneString.mockReturnValue(defaultDateTimeStr);

      let error;
      let result;
      try {
        result = await controller.create(payload);
      } catch (err) {
        error = err;
      }

      expect(usersService.create).toHaveBeenCalled();
      expect(usersService.create).toHaveBeenCalledWith(expect.objectContaining<Pick<UsersModel, 'username' | 'password' | 'role' | 'name' | 'age'>>({
        username: payload.username,
        password: payload.password,
        role: payload.role,
        name: payload.name,
        age: payload.age,
      }));
      expect(dateTime.gregorianWithTimezoneString).toHaveBeenCalledTimes(2);
      expect(error).toBeUndefined();
      expect(result).toMatchObject<FindOneResponse>({
        id: outputUsers.id,
        username: outputUsers.username,
        role: outputUsers.role,
        name: outputUsers.name,
        age: outputUsers.age,
        createAt: defaultDateTimeStr,
        updateAt: defaultDateTimeStr,
      });
    });
  });

  describe(`update`, () => {
    let payload: UpdateInputDto;
    let matchUpdateUser: UpdateModel<UsersModel>;

    beforeEach(() => {
      payload = new UpdateInputDto();
      payload.userId = identifierMock.generateId();
      payload.password = 'new-password';
      payload.name = 'new-name';

      matchUpdateUser = new UpdateModel<UsersModel>(payload.userId, {
        password: payload.password,
        name: payload.name,
      });
    });

    it(`Should error update user by id`, async () => {
      usersService.update.mockResolvedValue([new Error('fail')]);

      let error;
      try {
        await controller.update(payload);
      } catch (err) {
        error = err;
      }

      expect(usersService.update).toHaveBeenCalled();
      expect(usersService.update).toHaveBeenCalledWith(matchUpdateUser);
      expect(error).toBeInstanceOf(Error);
    });

    it(`Should successfully update user by id`, async () => {
      usersService.update.mockResolvedValue([null, 1]);

      let error;
      let result;
      try {
        result = await controller.update(payload);
      } catch (err) {
        error = err;
      }

      expect(usersService.update).toHaveBeenCalled();
      expect(usersService.update).toHaveBeenCalledWith(matchUpdateUser);
      expect(error).toBeUndefined();
      expect(result).toMatchObject<UpdateAndDeleteResponse>({count: 1});
    });
  });

  describe(`delete`, () => {
    let payload: FindOneQueryDto;

    beforeEach(() => {
      payload = new FindOneQueryDto();
      payload.userId = identifierMock.generateId();
    });

    it(`Should error delete user by id`, async () => {
      usersService.delete.mockResolvedValue([new Error('fail')]);

      let error;
      try {
        await controller.delete(payload);
      } catch (err) {
        error = err;
      }

      expect(usersService.delete).toHaveBeenCalled();
      expect(usersService.delete).toHaveBeenCalledWith(identifierMock.generateId());
      expect(error).toBeInstanceOf(Error);
    });

    it(`Should successfully delete user by id`, async () => {
      usersService.delete.mockResolvedValue([null, 1]);

      let error;
      let result;
      try {
        result = await controller.delete(payload);
      } catch (err) {
        error = err;
      }

      expect(usersService.delete).toHaveBeenCalled();
      expect(usersService.delete).toHaveBeenCalledWith(identifierMock.generateId());
      expect(error).toBeUndefined();
      expect(result).toMatchObject<UpdateAndDeleteResponse>({count: 1});
    });
  });
});
