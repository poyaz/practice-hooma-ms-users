import {UsersPgRepository} from './users-pg.repository';
import {AUTH_ENTITY_OPTIONS, AuthEntity} from '../entity/auth.entity';
import {FindManyOptions, Repository} from 'typeorm';
import {mock, MockProxy} from 'jest-mock-extended';
import {UsersEntity} from '../entity/users.entity';
import {IdentifierInterface} from '../../core/interface/identifier.interface';
import {DateTimeInterface} from '../../core/interface/date-time.interface';
import {Test, TestingModule} from '@nestjs/testing';
import {UsersModel, UsersRoleEnum} from '../../core/model/users.model';
import {SortEnum} from '@src-utility/model/filter.model';
import {RepositoryException} from '../../core/exception/repository.exception';
import {DefaultPropertiesSymbol, IsDefaultSymbol} from '@src-utility/model/symbol';

describe('UsersPgRepository', () => {
  let repository: UsersPgRepository;
  let authDb: MockProxy<Repository<AuthEntity>>;
  let usersDb: MockProxy<Repository<UsersEntity>>;
  let identifier: MockProxy<IdentifierInterface>;
  let dateTime: MockProxy<DateTimeInterface>;
  const defaultDate = new Date('2020-01-01');

  beforeEach(async () => {
    const authDbProvider = 'AUTH_DB';
    authDb = mock<Repository<AuthEntity>>();

    const usersDbProvider = 'USERS_DB';
    usersDb = mock<Repository<UsersEntity>>();

    const identifierProvider = 'IDENTIFIER';
    identifier = mock<IdentifierInterface>();
    identifier.generateId.mockReturnValue('00000000-0000-0000-0000-000000000000');

    const dateTimeProvider = 'DATE_TIME';
    dateTime = mock<DateTimeInterface>();
    dateTime.gregorianCurrentDateWithTimezone.mockReturnValue(defaultDate);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: authDbProvider,
          useValue: authDb,
        },
        {
          provide: usersDbProvider,
          useValue: usersDb,
        },
        {
          provide: identifierProvider,
          useValue: identifier,
        },
        {
          provide: dateTimeProvider,
          useValue: dateTime,
        },
        {
          provide: UsersPgRepository,
          inject: [authDbProvider, usersDbProvider, identifierProvider, dateTimeProvider],
          useFactory: (
            authDb: Repository<AuthEntity>,
            usersDb: Repository<UsersEntity>,
            identifier: IdentifierInterface,
            dateTimeProvider: DateTimeInterface,
          ) => new UsersPgRepository(authDb, usersDb, identifier, dateTimeProvider),
        },
      ],
    }).compile();

    repository = module.get<UsersPgRepository>(UsersPgRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe(`getAll`, () => {
    let outputUsersEntity1: UsersEntity;

    beforeEach(() => {
      outputUsersEntity1 = new UsersEntity();
      outputUsersEntity1.id = identifier.generateId();
      outputUsersEntity1.auth = new AuthEntity();
      outputUsersEntity1.auth.username = 'username';
      outputUsersEntity1.auth.password = 'password';
      outputUsersEntity1.auth.salt = 'salt';
      outputUsersEntity1.auth.role = UsersRoleEnum.USER;
      outputUsersEntity1.auth.createAt = defaultDate;
      outputUsersEntity1.name = 'name';
      outputUsersEntity1.age = 20;
      outputUsersEntity1.createAt = defaultDate;
      outputUsersEntity1.updateAt = null;
    });

    it(`Should error get all users`, async () => {
      const executeError = new Error('Error in create on database');
      usersDb.findAndCount.mockRejectedValue(executeError);

      const [error] = await repository.getAll();

      expect(usersDb.findAndCount).toHaveBeenCalled();
      expect(usersDb.findAndCount).toBeCalledWith(expect.objectContaining(<FindManyOptions<UsersEntity>>{
        relations: [AUTH_ENTITY_OPTIONS.tableName],
        order: {createAt: SortEnum.DESC},
      }));
      expect(error).toBeInstanceOf(RepositoryException);
      expect((<RepositoryException>error).cause).toEqual(executeError);
    });

    it(`Should successfully get all users and return empty record`, async () => {
      usersDb.findAndCount.mockResolvedValue([[], 0]);

      const [error, result, total] = await repository.getAll();

      expect(usersDb.findAndCount).toHaveBeenCalled();
      expect(usersDb.findAndCount).toBeCalledWith(expect.objectContaining(<FindManyOptions<UsersEntity>>{
        relations: [AUTH_ENTITY_OPTIONS.tableName],
        order: {createAt: SortEnum.DESC},
      }));
      expect(error).toBeNull();
      expect(result.length).toEqual(0);
      expect(total).toEqual(0);
    });

    it(`Should successfully get all users and return data`, async () => {
      usersDb.findAndCount.mockResolvedValue([[outputUsersEntity1], 1]);

      const [error, result, total] = await repository.getAll();

      expect(usersDb.findAndCount).toHaveBeenCalled();
      expect(usersDb.findAndCount).toBeCalledWith(expect.objectContaining(<FindManyOptions<UsersEntity>>{
        relations: [AUTH_ENTITY_OPTIONS.tableName],
        order: {createAt: SortEnum.DESC},
      }));
      expect(error).toBeNull();
      expect(result.length).toEqual(1);
      expect(result[0]).toMatchObject<Omit<UsersModel, 'clone' | typeof IsDefaultSymbol | typeof DefaultPropertiesSymbol>>({
        id: identifier.generateId(),
        username: outputUsersEntity1.auth.username,
        password: outputUsersEntity1.auth.password,
        salt: outputUsersEntity1.auth.salt,
        role: UsersRoleEnum.USER,
        name: outputUsersEntity1.name,
        age: outputUsersEntity1.age,
        createAt: defaultDate,
      });
      expect(total).toEqual(1);
    });
  });
});
