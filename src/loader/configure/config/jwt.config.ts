import {registerAs} from '@nestjs/config';
import {JwtConfigInterface} from '@src-loader/configure/interface/jwt-config.interface';
import {resolve} from 'path';
import {readFileSync} from 'fs';

export default registerAs('jwt', (): JwtConfigInterface => {
  return {
    algorithm: process.env.JWT_ALGORITHM_TYPE || 'RS256',
    publicKey: readFileSync(resolve(process.env.JWT_PUBLIC_KEY_FILE.toString()), 'utf8'),
    expiresTime: process.env.JWT_EXPIRE_TIME || '1w',
  };
});
