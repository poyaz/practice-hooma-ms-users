import {IsDefined, IsEnum, IsIn, IsNumber, IsOptional, IsString, IsUrl} from 'class-validator';
import {EnvironmentEnv} from '@src-loader/configure/enum/environment.env';
import {Transform} from 'class-transformer';
import {BooleanEnv} from '@src-loader/configure/enum/boolean.env';

export class EnvConfigDto {
  @IsOptional()
  @IsString()
  TZ?: string;

  @IsOptional()
  @IsEnum(EnvironmentEnv)
  @Transform(param => param.value.toLowerCase())
  NODE_ENV?: EnvironmentEnv;

  @IsOptional()
  @IsString()
  SERVER_HOST?: string;

  @IsOptional()
  @IsNumber()
  SERVER_GRPC_PORT?: number;

  JWT_ALGORITHM_TYPE?: string;

  @IsDefined()
  @IsString()
  JWT_PUBLIC_KEY_FILE: string;

  @IsOptional()
  @IsString()
  JWT_EXPIRE_TIME?: string;

  @IsOptional()
  @IsString()
  DB_PG_HOST?: string;

  @IsOptional()
  @IsNumber()
  DB_PG_PORT?: number;

  @IsOptional()
  @IsString()
  DB_PG_DATABASE?: string;

  @IsOptional()
  @IsString()
  DB_PG_USERNAME?: string;

  @IsOptional()
  @IsString()
  DB_PG_PASSWORD?: string;

  @IsOptional()
  @IsString()
  DB_PG_PASSWORD_FILE?: string;

  @IsOptional()
  @IsNumber()
  DB_PG_MIN?: number;

  @IsOptional()
  @IsNumber()
  DB_PG_MAX?: number;

  @IsOptional()
  @IsNumber()
  DB_PG_IDLE_TIMEOUT?: number;

  @IsOptional()
  @IsEnum(BooleanEnv)
  @Transform(param => param.value.toLowerCase())
  DB_PG_USE_TLS?: BooleanEnv;

  @IsOptional()
  @IsEnum(BooleanEnv)
  @Transform(param => param.value.toLowerCase())
  DB_PG_TLS_REJECT_UNAUTHORIZED?: BooleanEnv;

  @IsOptional()
  @IsString()
  DB_PG_APPLICATION_NAME?: string;
}


