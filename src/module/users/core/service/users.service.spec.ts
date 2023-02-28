import {Test, TestingModule} from '@nestjs/testing';
import {UsersService} from './users.service';
import {mock, MockProxy} from 'jest-mock-extended';
import {GenericRepositoryInterface} from '../interface/generic-repository.interface';
import {UsersModel, UsersRoleEnum} from '../model/users.model';
import {IdentifierInterface} from '../interface/identifier.interface';
import {RepositoryException} from '../exception/repository.exception';

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

      expect(error).toBeInstanceOf(RepositoryException);
      expect((<RepositoryException>error).cause).toEqual(executeError);
    });

    it(`Should successfully get all users and return empty record`, async () => {
      usersRepository.getAll.mockResolvedValue([null, [], 0]);

      const [error, result, total] = await service.getAll();

      expect(error).toBeNull();
      expect(total).toEqual(0);
      expect(result).toHaveLength(0);
    });

    it(`Should successfully get all users and return records`, async () => {
      usersRepository.getAll.mockResolvedValue([null, [outputUsers1], 1]);

      const [error, result, total] = await service.getAll();

      expect(error).toBeNull();
      expect(total).toEqual(1);
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(outputUsers1);
    });
  });
});
