import {registerAs} from '@nestjs/config';
import {ServerConfigInterface} from '@src-loader/configure/interface/server-config.interface';

export default registerAs('server', (): ServerConfigInterface => {
  return {
    host: process.env.SERVER_HOST || '0.0.0.0',
    grpc: {
      port: Number(process.env.SERVER_GRPC_PORT || 3000),
    },
  };
});
