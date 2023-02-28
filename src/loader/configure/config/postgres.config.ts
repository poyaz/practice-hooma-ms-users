import {registerAs} from '@nestjs/config';
import {convertStringToBoolean} from '@src-loader/configure/util';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import {DatabaseConfigInterface} from '@src-loader/configure/interface/database-config.interface';

export default registerAs('postgres', (): DatabaseConfigInterface => {
  let password;
  if (process.env.DB_PG_PASSWORD_FILE) {
    password = readFileSync(resolve(process.env.DB_PG_PASSWORD_FILE), 'utf8')
      .split(/\r?\n/g)
      .filter((v, i, arr) => !(v === '' && i === arr.length - 1))
      .join('\n');
  } else if (process.env.DB_PG_PASSWORD) {
    password = process.env.DB_PG_PASSWORD;
  }

  return {
    host: process.env.DB_PG_HOST || 'db',
    port: Number(process.env.DB_PG_PORT || 5432),
    db: process.env.DB_PG_DATABASE || 'postgres',
    username: process.env.DB_PG_USERNAME || 'postgres',
    password,
    enableTls: convertStringToBoolean(process.env.DB_PG_USE_TLS),
    rejectUnauthorized: convertStringToBoolean(process.env.DB_PG_TLS_REJECT_UNAUTHORIZED),
    applicationName: process.env.DB_PG_APPLICATION_NAME || 'auth',
    ...(process.env.DB_PG_MIN && {min: Number(process.env.DB_PG_MIN)}),
    ...(process.env.DB_PG_MAX && {max: Number(process.env.DB_PG_MAX)}),
    ...(process.env.DB_PG_IDLE_TIMEOUT && {idleTimeout: Number(process.env.DB_PG_IDLE_TIMEOUT)}),
  };
});
