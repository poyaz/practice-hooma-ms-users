import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {resolve} from 'path';
import {envValidate} from './validate/env.validation';
import serverConfig from './config/server.config';
import jwtConfig from './config/jwt.config';
import postgresConfig from '@src-loader/configure/config/postgres.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: resolve('env', 'app', '.env'),
      validate: envValidate,
      load: [
        serverConfig,
        jwtConfig,
        postgresConfig,
      ],
    }),
  ],
})
export class ConfigureModule {
}
