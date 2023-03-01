import {Logger, Module} from '@nestjs/common';
import {ConfigureModule} from '@src-loader/configure/configure.module';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {LoggerModule} from 'nestjs-pino';
import {APP_FILTER, APP_GUARD} from '@nestjs/core';
import {PgModule} from '@src-loader/database/pg.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {PgConfigService} from '@src-loader/database/pg-config.service';
import {UsersModule} from './module/users/users.module';
import {GrpcExceptionFilter} from './api/grpc/filter/grpc-exception.filter';
import {CommandModule} from './api/command/command.module';
import {GrpcAuthGuard} from './api/grpc/guard/grpc-auth.guard';
import {JwtModule} from '@nestjs/jwt';
import {JwtConfigInterface} from '@src-loader/configure/interface/jwt-config.interface';
import {Algorithm} from 'jsonwebtoken';

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

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtConfig = configService.get<JwtConfigInterface>('jwt');
        let algorithm: Algorithm;
        switch (jwtConfig.algorithm) {
          case 'RS256':
            algorithm = 'RS256';
            break;
        }

        return {
          publicKey: jwtConfig.publicKey,
          signOptions: {
            algorithm,
            expiresIn: jwtConfig.expiresTime,
          },
        };
      },
    }),

    CommandModule,
    UsersModule,
  ],
  controllers: [],
  providers: [
    Logger,
    ConfigService,

    {
      provide: APP_GUARD,
      useClass: GrpcAuthGuard,
    },

    {
      provide: APP_FILTER,
      useClass: GrpcExceptionFilter,
    },
  ],
})
export class AppModule {
}
