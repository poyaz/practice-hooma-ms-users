import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {UsersController} from './api/grpc/controller/users/users.controller';
import {UuidIdentifier} from './infrastructure/system/uuid-identifier';
import {DateTime} from './infrastructure/system/date-time';
import {ProviderEnum} from './api/enum/provider.enum';
import {UsersService} from './core/service/users.service';
import {UsersServiceInterface} from './core/interface/users-service.interface';
import {getRepositoryToken, TypeOrmModule} from '@nestjs/typeorm';
import {DataSource, Repository} from 'typeorm';
import {AuthEntity} from './infrastructure/entity/auth.entity';
import {UsersEntity} from './infrastructure/entity/users.entity';
import {IdentifierInterface} from './core/interface/identifier.interface';
import {DateTimeInterface} from './core/interface/date-time.interface';
import {UsersPgRepository} from './infrastructure/repository/users-pg.repository';
import {GenericRepositoryInterface} from './core/interface/generic-repository.interface';
import {UsersModel} from './core/model/users.model';

@Module({
  imports: [
    TypeOrmModule.forFeature([AuthEntity, UsersEntity]),
  ],
  controllers: [UsersController],
  providers: [
    ConfigService,
    {
      provide: ProviderEnum.USERS_SERVICE,
      inject: [UsersService],
      useFactory: (userService: UsersServiceInterface) => {
        return userService;
      },
    },
    {
      provide: ProviderEnum.DATE_TIME,
      inject: [DateTime],
      useFactory: (dateTime: DateTimeInterface) => {
        return dateTime;
      },
    },
    {
      provide: UsersService,
      inject: [UsersPgRepository],
      useFactory: (usersPgRepository: GenericRepositoryInterface<UsersModel>) => {
        return new UsersService(usersPgRepository);
      },
    },
    {
      provide: UsersPgRepository,
      inject: [
        DataSource,
        getRepositoryToken(AuthEntity),
        getRepositoryToken(UsersEntity),
        UuidIdentifier,
        DateTime,
      ],
      useFactory: (
        dataSource: DataSource,
        authDb: Repository<AuthEntity>,
        usersDb: Repository<UsersEntity>,
        identifier: IdentifierInterface,
        dateTime: DateTimeInterface,
      ) => {
        return new UsersPgRepository(dataSource, authDb, usersDb, identifier, dateTime);
      },
    },
    {
      provide: UuidIdentifier,
      inject: [],
      useFactory: () => new UuidIdentifier(),
    },
    {
      provide: DateTime,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const tzConfig = configService.get<string>('TZ');
        if (!tzConfig) {
          return new DateTime();
        }

        return new DateTime('en', tzConfig);
      },
    },
  ],
})
export class UsersModule {
}
