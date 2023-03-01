import {UsersPgRepository} from './users-pg.repository';
import {AUTH_ENTITY_OPTIONS, AuthEntity} from '../entity/auth.entity';
import {DataSource, FindManyOptions, Repository} from 'typeorm';
import {mock, MockProxy} from 'jest-mock-extended';
import {UsersEntity} from '../entity/users.entity';
import {IdentifierInterface} from '../../core/interface/identifier.interface';
import {DateTimeInterface} from '../../core/interface/date-time.interface';
import {Test, TestingModule} from '@nestjs/testing';
import {UsersModel, UsersRoleEnum} from '../../core/model/users.model';
import {SortEnum} from '@src-utility/model/filter.model';
import {RepositoryException} from '../../core/exception/repository.exception';
import {DefaultPropertiesSymbol, IsDefaultSymbol} from '@src-utility/model/symbol';
import {QueryRunner} from 'typeorm/query-runner/QueryRunner';
import {EntityManager} from 'typeorm/entity-manager/EntityManager';

describe('UsersPgRepository', () => {
  let repository: UsersPgRepository;
  let dataSource: MockProxy<DataSource>;
  let manager: MockProxy<EntityManager>;
  let queryRunner: MockProxy<QueryRunner>;
  let authDb: MockProxy<Repository<AuthEntity>>;
  let usersDb: MockProxy<Repository<UsersEntity>>;
  let identifier: MockProxy<IdentifierInterface>;
  let dateTime: MockProxy<DateTimeInterface>;
  const defaultDate = new Date('2020-01-01');

  beforeEach(async () => {
    const dataSourceProvider = 'DATA_SOURCE';
    dataSource = mock<DataSource>();

    manager = mock<EntityManager>();
    queryRunner = mock<QueryRunner>({manager});

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
          provide: dataSourceProvider,
          useValue: dataSource,
        },
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
          inject: [dataSourceProvider, authDbProvider, usersDbProvider, identifierProvider, dateTimeProvider],
          useFactory: (
            dataSource: DataSource,
            authDb: Repository<AuthEntity>,
            usersDb: Repository<UsersEntity>,
            identifier: IdentifierInterface,
            dateTimeProvider: DateTimeInterface,
          ) => new UsersPgRepository(dataSource, authDb, usersDb, identifier, dateTimeProvider),
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

  describe(`getById`, () => {
    let inputId: string;
    let outputUsersEntity: UsersEntity;

    beforeEach(() => {
      inputId = identifier.generateId();

      outputUsersEntity = new UsersEntity();
      outputUsersEntity.id = identifier.generateId();
      outputUsersEntity.auth = new AuthEntity();
      outputUsersEntity.auth.username = 'username';
      outputUsersEntity.auth.password = 'password';
      outputUsersEntity.auth.salt = 'salt';
      outputUsersEntity.auth.role = UsersRoleEnum.USER;
      outputUsersEntity.auth.createAt = defaultDate;
      outputUsersEntity.name = 'name';
      outputUsersEntity.age = 20;
      outputUsersEntity.createAt = defaultDate;
      outputUsersEntity.updateAt = null;
    });

    it(`Should error get user by id`, async () => {
      const executeError = new Error('Error in create on database');
      usersDb.findOne.mockRejectedValue(executeError);

      const [error] = await repository.getById(inputId);

      expect(usersDb.findOne).toHaveBeenCalled();
      expect(usersDb.findOne).toBeCalledWith(expect.objectContaining(<FindManyOptions<UsersEntity>>{
        relations: [AUTH_ENTITY_OPTIONS.tableName],
        where: {id: inputId},
        order: {createAt: SortEnum.DESC},
      }));
      expect(error).toBeInstanceOf(RepositoryException);
      expect((<RepositoryException>error).cause).toEqual(executeError);
    });

    it(`Should successfully get user by id and return null`, async () => {
      usersDb.findOne.mockResolvedValue(null);

      const [error, result] = await repository.getById(inputId);

      expect(usersDb.findOne).toHaveBeenCalled();
      expect(usersDb.findOne).toBeCalledWith(expect.objectContaining(<FindManyOptions<UsersEntity>>{
        relations: [AUTH_ENTITY_OPTIONS.tableName],
        where: {id: inputId},
        order: {createAt: SortEnum.DESC},
      }));
      expect(error).toBeNull();
      expect(result).toBeNull();
    });

    it(`Should successfully get user by id and return data`, async () => {
      usersDb.findOne.mockResolvedValue(outputUsersEntity);

      const [error, result] = await repository.getById(inputId);

      expect(usersDb.findOne).toHaveBeenCalled();
      expect(usersDb.findOne).toBeCalledWith(expect.objectContaining(<FindManyOptions<UsersEntity>>{
        relations: [AUTH_ENTITY_OPTIONS.tableName],
        where: {id: inputId},
        order: {createAt: SortEnum.DESC},
      }));
      expect(error).toBeNull();
      expect(result).toMatchObject<Omit<UsersModel, 'clone' | typeof IsDefaultSymbol | typeof DefaultPropertiesSymbol>>({
        id: identifier.generateId(),
        username: outputUsersEntity.auth.username,
        password: outputUsersEntity.auth.password,
        salt: outputUsersEntity.auth.salt,
        role: UsersRoleEnum.USER,
        name: outputUsersEntity.name,
        age: outputUsersEntity.age,
        createAt: defaultDate,
      });
    });
  });

  describe(`create`, () => {
    let inputModel: UsersModel;
    let outputAuthEntity: AuthEntity;
    let outputUsersEntity: UsersEntity;

    beforeEach(() => {
      inputModel = UsersModel.getDefaultModel();
      inputModel.username = 'username';
      inputModel.password = 'password';
      inputModel.salt = 'salt';
      inputModel.role = UsersRoleEnum.USER;
      inputModel.name = 'name';
      inputModel.age = 20;

      outputAuthEntity = new AuthEntity();
      outputAuthEntity.username = 'username';
      outputAuthEntity.password = 'password';
      outputAuthEntity.salt = 'salt';
      outputAuthEntity.role = UsersRoleEnum.USER;
      outputAuthEntity.createAt = defaultDate;

      outputUsersEntity = new UsersEntity();
      outputUsersEntity.id = identifier.generateId();
      outputUsersEntity.name = 'name';
      outputUsersEntity.age = 20;
      outputUsersEntity.createAt = defaultDate;
      outputUsersEntity.updateAt = null;
    });

    it(`Should error create users when create connection`, async () => {
      dataSource.createQueryRunner.mockReturnValue(queryRunner);
      const executeError = new Error('connect');
      queryRunner.connect.mockRejectedValue(executeError);

      const [error] = await repository.create(inputModel);

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(0);
      expect(queryRunner.release).toHaveBeenCalledTimes(0);
      expect(error).toBeInstanceOf(RepositoryException);
      expect((<RepositoryException>error).cause).toEqual(executeError);
    });

    it(`Should error create users when create transaction`, async () => {
      dataSource.createQueryRunner.mockReturnValue(queryRunner);
      queryRunner.connect.mockResolvedValue(null);
      const executeError = new Error('transaction');
      queryRunner.startTransaction.mockRejectedValue(executeError);

      const [error] = await repository.create(inputModel);

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(0);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
      expect(error).toBeInstanceOf(RepositoryException);
      expect((<RepositoryException>error).cause).toEqual(executeError);
    });

    it(`Should error create users when insert auth data`, async () => {
      dataSource.createQueryRunner.mockReturnValue(queryRunner);
      queryRunner.connect.mockResolvedValue(null);
      queryRunner.startTransaction.mockResolvedValue(null);
      const executeError = new Error('insert auth');
      (manager.save).mockRejectedValueOnce(executeError);
      queryRunner.rollbackTransaction.mockResolvedValue(null);

      const [error] = await repository.create(inputModel);

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.manager.save).toHaveBeenCalledTimes(1);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
      expect(error).toBeInstanceOf(RepositoryException);
      expect((<RepositoryException>error).cause).toEqual(executeError);
    });

    it(`Should error create users when insert auth data and fail to rollback`, async () => {
      dataSource.createQueryRunner.mockReturnValue(queryRunner);
      queryRunner.connect.mockResolvedValue(null);
      queryRunner.startTransaction.mockResolvedValue(null);
      const executeError = new Error('insert auth');
      (manager.save).mockRejectedValueOnce(executeError);
      const rollbackError = new Error('rollback');
      queryRunner.rollbackTransaction.mockRejectedValueOnce(rollbackError);

      const [error] = await repository.create(inputModel);

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.manager.save).toHaveBeenCalledTimes(1);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
      expect(error).toBeInstanceOf(RepositoryException);
      expect((<RepositoryException>error).cause).toEqual(executeError);
      expect((<RepositoryException>error).combine).toHaveLength(1);
      expect((<RepositoryException>error).combine[0]).toEqual(rollbackError);
    });

    it(`Should error create users when insert users data`, async () => {
      dataSource.createQueryRunner.mockReturnValue(queryRunner);
      queryRunner.connect.mockResolvedValue(null);
      queryRunner.startTransaction.mockResolvedValue(null);
      const executeError = new Error('insert users');
      (manager.save).mockResolvedValueOnce(outputAuthEntity).mockRejectedValueOnce(executeError);
      queryRunner.rollbackTransaction.mockResolvedValue(null);

      const [error] = await repository.create(inputModel);

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.manager.save).toHaveBeenCalledTimes(2);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
      expect(error).toBeInstanceOf(RepositoryException);
      expect((<RepositoryException>error).cause).toEqual(executeError);
    });

    it(`Should error create users when insert users data and fail to rollback`, async () => {
      dataSource.createQueryRunner.mockReturnValue(queryRunner);
      queryRunner.connect.mockResolvedValue(null);
      queryRunner.startTransaction.mockResolvedValue(null);
      const executeError = new Error('insert auth');
      (manager.save).mockResolvedValueOnce(outputAuthEntity).mockRejectedValueOnce(executeError);
      const rollbackError = new Error('rollback');
      queryRunner.rollbackTransaction.mockRejectedValueOnce(rollbackError);

      const [error] = await repository.create(inputModel);

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.manager.save).toHaveBeenCalledTimes(2);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(1);
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
      expect(error).toBeInstanceOf(RepositoryException);
      expect((<RepositoryException>error).cause).toEqual(executeError);
      expect((<RepositoryException>error).combine).toHaveLength(1);
      expect((<RepositoryException>error).combine[0]).toEqual(rollbackError);
    });

    it(`Should successfully create users`, async () => {
      dataSource.createQueryRunner.mockReturnValue(queryRunner);
      queryRunner.connect.mockResolvedValue(null);
      queryRunner.startTransaction.mockResolvedValue(null);
      (manager.save).mockResolvedValueOnce(outputAuthEntity).mockResolvedValueOnce(outputUsersEntity);
      queryRunner.commitTransaction.mockResolvedValue(null);

      const [error, result] = await repository.create(inputModel);

      expect(dataSource.createQueryRunner).toHaveBeenCalled();
      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.manager.save).toHaveBeenCalledTimes(2);
      expect(queryRunner.rollbackTransaction).toHaveBeenCalledTimes(0);
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalledTimes(1);
      expect(error).toBeNull();
      expect(result).toMatchObject<Omit<UsersModel, 'clone' | typeof IsDefaultSymbol | typeof DefaultPropertiesSymbol>>({
        id: outputUsersEntity.id,
        username: outputAuthEntity.username,
        password: outputAuthEntity.password,
        salt: outputAuthEntity.salt,
        role: UsersRoleEnum.USER,
        name: outputUsersEntity.name,
        age: outputUsersEntity.age,
        createAt: defaultDate,
      });
    });
  });
});
