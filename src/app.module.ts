import {Logger, Module} from '@nestjs/common';
import {ConfigureModule} from '@src-loader/configure/configure.module';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {LoggerModule} from 'nestjs-pino';
import {APP_FILTER} from '@nestjs/core';
import {PgModule} from '@src-loader/database/pg.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PgConfigService} from '@src-loader/database/pg-config.service';
import {UsersModule} from './module/users/users.module';
import {GrpcExceptionFilter} from './api/grpc/filter/grpc-exception.filter';
import {CommandModule} from './api/command/command.module';

@Module({
  imports: [
    ConfigureModule,
    LoggerModule.forRoot({
      pinoHttp: {
        autoLogging: true,
        genReqId: () => null,
        quietReqLogger: false,
        transport: {target: 'pino-pretty'},
      },
    }),

    PgModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useClass: PgConfigService,
      extraProviders: [
        {
          provide: 'USE_CLI',
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => {
            return configService.get('MS_AUTH_BOOTSTRAP') === 'cli';
          },
        },
      ],
    }),

    CommandModule,
    UsersModule,
  ],
  controllers: [],
  providers: [
    Logger,
    ConfigService,

    {
      provide: APP_FILTER,
      useClass: GrpcExceptionFilter,
    },
  ],
})
export class AppModule {
}
