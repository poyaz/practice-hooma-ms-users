import {UsersPgRepository} from './users-pg.repository';
import {AuthEntity} from '../entity/auth.entity';
import {Repository} from 'typeorm';
import {mock, MockProxy} from 'jest-mock-extended';
import {UsersEntity} from '../entity/users.entity';
import {IdentifierInterface} from '../../core/interface/identifier.interface';
import {DateTimeInterface} from '../../core/interface/date-time.interface';
import {Test, TestingModule} from '@nestjs/testing';

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

  });
});