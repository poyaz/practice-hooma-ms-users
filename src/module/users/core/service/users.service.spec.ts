import {Test, TestingModule} from '@nestjs/testing';
import {UsersService} from './users.service';
import {mock, MockProxy} from 'jest-mock-extended';
import {GenericRepositoryInterface} from '../interface/generic-repository.interface';
import {UsersModel, UsersRoleEnum} from '../model/users.model';
import {IdentifierInterface} from '../interface/identifier.interface';
import {RepositoryException} from '../exception/repository.exception';
import {NotFoundException} from '../exception/not-found.exception';
import {UpdateModel} from '@src-utility/model/update.model';

jest.mock('bcrypt');
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: MockProxy<GenericRepositoryInterface<UsersModel>>;
  let identifierMock: MockProxy<IdentifierInterface>;
  const defaultDate = new Date('2020-01-01');

  beforeEach(async () => {
    const usersRepositoryProvider = 'USERS_REPOSITORY';
    usersRepository = mock<GenericRepositoryInterface<UsersModel>>();

    identifierMock = mock<IdentifierInterface>();
    identifierMock.generateId.mockReturnValue('11111111-1111-1111-1111-111111111111');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: usersRepositoryProvider,
          useValue: usersRepository,
        },
        {
          provide: UsersService,
          inject: [usersRepositoryProvider],
          useFactory: (usersRepository: GenericRepositoryInterface<UsersModel>) => new UsersService(usersRepository),
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);

    jest.useFakeTimers().setSystemTime(defaultDate);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe(`getAll`, () => {
    let outputUsers1: UsersModel;

    beforeEach(() => {
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

    it(`Should error get all users`, async () => {
      const executeError = new Error('error');
      usersRepository.getAll.mockResolvedValue([new RepositoryException(executeError)]);

      const [error] = await service.getAll();

      expect(usersRepository.getAll).toHaveBeenCalled();
      expect(error).toBeInstanceOf(RepositoryException);
      expect((<RepositoryException>error).cause).toEqual(executeError);
    });

    it(`Should successfully get all users and return empty record`, async () => {
      usersRepository.getAll.mockResolvedValue([null, [], 0]);

      const [error, result, total] = await service.getAll();

      expect(usersRepository.getAll).toHaveBeenCalled();
      expect(error).toBeNull();
      expect(total).toEqual(0);
      expect(result).toHaveLength(0);
    });

    it(`Should successfully get all users and return records`, async () => {
      usersRepository.getAll.mockResolvedValue([null, [outputUsers1], 1]);

      const [error, result, total] = await service.getAll();

      expect(usersRepository.getAll).toHaveBeenCalled();
      expect(error).toBeNull();
      expect(total).toEqual(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(outputUsers1);
    });
  });

  describe(`getById`, () => {
    let inputId: string;
    let outputUsers: UsersModel;

    beforeEach(() => {
      inputId = identifierMock.generateId();

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

    it(`Should error get user by id`, async () => {
      const executeError = new Error('error');
      usersRepository.getById.mockResolvedValue([new RepositoryException(executeError)]);

      const [error] = await service.getById(inputId);

      expect(usersRepository.getById).toHaveBeenCalled();
      expect(usersRepository.getById).toHaveBeenCalledWith(inputId);
      expect(error).toBeInstanceOf(RepositoryException);
      expect((<RepositoryException>error).cause).toEqual(executeError);
    });

    it(`Should error get user by id when user not found`, async () => {
      usersRepository.getById.mockResolvedValue([null, null]);

      const [error] = await service.getById(inputId);

      expect(usersRepository.getById).toHaveBeenCalled();
      expect(usersRepository.getById).toHaveBeenCalledWith(inputId);
      expect(error).toBeInstanceOf(NotFoundException);
    });

    it(`Should successfully get user by id`, async () => {
      usersRepository.getById.mockResolvedValue([null, outputUsers]);

      const [error, result] = await service.getById(inputId);

      expect(usersRepository.getById).toHaveBeenCalled();
      expect(usersRepository.getById).toHaveBeenCalledWith(inputId);
      expect(error).toBeNull();
      expect(result).toEqual(outputUsers);
    });
  });

  describe(`create`, () => {
    let inputModel: UsersModel;
    let outputUsers: UsersModel;
    let passwordSalt: string;
    let passwordHash: string;

    beforeEach(() => {
      inputModel = UsersModel.getDefaultModel();
      inputModel.username = 'username';
      inputModel.password = 'password';
      inputModel.role = UsersRoleEnum.USER;
      inputModel.name = 'name';
      inputModel.age = 20;

      passwordSalt = 'random-salt';
      passwordHash = 'password-hash';

      outputUsers = new UsersModel({
        id: identifierMock.generateId(),
        username: inputModel.username,
        password: passwordHash,
        salt: passwordSalt,
        role: inputModel.role,
        name: inputModel.name,
        age: inputModel.age,
        createAt: defaultDate,
      });
    });

    it(`Should error create new users`, async () => {
      (<jest.Mock>bcrypt.genSalt).mockResolvedValue(passwordSalt);
      (<jest.Mock>bcrypt.hash).mockResolvedValue(passwordHash);
      const executeError = new Error('error');
      usersRepository.create.mockResolvedValue([new RepositoryException(executeError)]);

      const [error] = await service.create(inputModel);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(inputModel.password, passwordSalt);
      expect(usersRepository.create).toHaveBeenCalled();
      expect(usersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining<Pick<UsersModel, 'username' | 'password' | 'salt' | 'role' | 'name' | 'age'>>({
          username: inputModel.username,
          password: passwordHash,
          salt: passwordSalt,
          role: inputModel.role,
          name: inputModel.name,
          age: inputModel.age,
        })
      );
      expect(error).toBeInstanceOf(RepositoryException);
      expect((<RepositoryException>error).cause).toEqual(executeError);
    })

    it(`Should successfully create new users`, async () => {
      (<jest.Mock>bcrypt.genSalt).mockResolvedValue(passwordSalt);
      (<jest.Mock>bcrypt.hash).mockResolvedValue(passwordHash);
      usersRepository.create.mockResolvedValue([null, outputUsers]);

      const [error, result] = await service.create(inputModel);

      expect(bcrypt.genSalt).toHaveBeenCalled();
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(inputModel.password, passwordSalt);
      expect(usersRepository.create).toHaveBeenCalled();
      expect(usersRepository.create).toHaveBeenCalledWith(
        expect.objectContaining<Pick<UsersModel, 'username' | 'password' | 'salt' | 'role' | 'name' | 'age'>>({
          username: inputModel.username,
          password: passwordHash,
          salt: passwordSalt,
          role: inputModel.role,
          name: inputModel.name,
          age: inputModel.age,
        })
      );
      expect(error).toBeNull();
      expect(result).toEqual(outputUsers);
    })
  })

  describe(`update`, () => {
    let inputId: string;
    let inputPassword: string;
    let inputModel: UpdateModel<UsersModel>;
    let getByIdMock;
    let outputUsers: UsersModel;
    let passwordHash: string;
    let matchUpdateModel: UpdateModel<UsersModel>;

    beforeEach(() => {
      inputId = identifierMock.generateId();
      inputPassword = 'new-password';
      inputModel = new UpdateModel<UsersModel>(inputId, {
        password: inputPassword,
        age: 21,
      });

      getByIdMock = service.getById = jest.fn();

      outputUsers = new UsersModel({
        id: identifierMock.generateId(),
        username: 'username',
        password: 'password-hash',
        salt: 'random-salt',
        role: UsersRoleEnum.USER,
        name: 'name',
        age: 20,
        createAt: defaultDate,
      });

      passwordHash = 'new-password-hash';

      matchUpdateModel = new UpdateModel<UsersModel>(inputId, {
        password: passwordHash,
        age: 21,
      });
    })

    afterEach(() => {
      getByIdMock.mockClear();
    })

    it(`Should error update user when get user by id`, async () => {
      getByIdMock.mockResolvedValue([new NotFoundException()]);

      const [error] = await service.update(inputModel);

      expect(getByIdMock).toHaveBeenCalled();
      expect(getByIdMock).toHaveBeenCalledWith(inputModel.id);
      expect(error).toBeInstanceOf(NotFoundException);
    })

    it(`Should error update user when update by id`, async () => {
      getByIdMock.mockResolvedValue([null, outputUsers]);
      (<jest.Mock>bcrypt.hash).mockResolvedValue(passwordHash);
      const executeError = new Error('error');
      usersRepository.update.mockResolvedValue([new RepositoryException(executeError)]);

      const [error] = await service.update(inputModel);

      expect(getByIdMock).toHaveBeenCalled();
      expect(getByIdMock).toHaveBeenCalledWith(inputModel.id);
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(inputPassword, outputUsers.salt);
      expect(usersRepository.update).toHaveBeenCalled();
      expect(usersRepository.update).toHaveBeenCalledWith(matchUpdateModel);
      expect(error).toBeInstanceOf(RepositoryException);
      expect((<RepositoryException>error).cause).toEqual(executeError);
    })

    it(`Should successfully update user when update by id`, async () => {
      getByIdMock.mockResolvedValue([null, outputUsers]);
      (<jest.Mock>bcrypt.hash).mockResolvedValue(passwordHash);
      const executeError = new Error('error');
      usersRepository.update.mockResolvedValue([null, 1]);

      const [error, result] = await service.update(inputModel);

      expect(getByIdMock).toHaveBeenCalled();
      expect(getByIdMock).toHaveBeenCalledWith(inputModel.id);
      expect(bcrypt.hash).toHaveBeenCalled();
      expect(bcrypt.hash).toHaveBeenCalledWith(inputPassword, outputUsers.salt);
      expect(usersRepository.update).toHaveBeenCalled();
      expect(usersRepository.update).toHaveBeenCalledWith(matchUpdateModel);
      expect(error).toBeNull();
      expect(result).toEqual(1);
    })
  })

  describe(`delete`, () => {
    let inputId: string;
    let getByIdMock;
    let outputUsers: UsersModel;

    beforeEach(() => {
      inputId = identifierMock.generateId();

      getByIdMock = service.getById = jest.fn();

      outputUsers = UsersModel.getDefaultModel();
    })

    afterEach(() => {
      getByIdMock.mockClear();
    })

    it(`Should error delete user when get user by id`, async () => {
      getByIdMock.mockResolvedValue([new NotFoundException()]);

      const [error] = await service.delete(inputId);

      expect(getByIdMock).toHaveBeenCalled();
      expect(getByIdMock).toHaveBeenCalledWith(inputId);
      expect(error).toBeInstanceOf(NotFoundException);
    })

    it(`Should error delete user when delete user by id`, async () => {
      getByIdMock.mockResolvedValue([null, outputUsers]);
      const executeError = new Error('error');
      usersRepository.delete.mockResolvedValue([new RepositoryException(executeError)]);

      const [error] = await service.delete(inputId);

      expect(getByIdMock).toHaveBeenCalled();
      expect(getByIdMock).toHaveBeenCalledWith(inputId);
      expect(usersRepository.delete).toHaveBeenCalled();
      expect(usersRepository.delete).toHaveBeenCalledWith(inputId);
      expect(error).toBeInstanceOf(RepositoryException);
      expect((<RepositoryException>error).cause).toEqual(executeError);
    })

    it(`Should successfully delete user when delete user by id`, async () => {
      getByIdMock.mockResolvedValue([null, outputUsers]);
      const executeError = new Error('error');
      usersRepository.delete.mockResolvedValue([null, 1]);

      const [error, result] = await service.delete(inputId);

      expect(getByIdMock).toHaveBeenCalled();
      expect(getByIdMock).toHaveBeenCalledWith(inputId);
      expect(usersRepository.delete).toHaveBeenCalled();
      expect(usersRepository.delete).toHaveBeenCalledWith(inputId);
      expect(error).toBeNull();
      expect(result).toEqual(1);
    })
  })
});
