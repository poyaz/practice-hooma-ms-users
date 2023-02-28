import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ConfigService} from '@nestjs/config';
import {Transport} from '@nestjs/microservices';
import {ServerConfigInterface} from '@src-loader/configure/interface/server-config.interface';
import {resolve} from 'path';
import {ValidationPipe} from '@nestjs/common';
import {protobufPackage} from './module/users/api/grpc/controller/users/users.pb';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get(ConfigService);

  const SERVER_OPTIONS = configService.get<ServerConfigInterface>('server');

  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.GRPC,
    options: {
      url: `${SERVER_OPTIONS.host}:${SERVER_OPTIONS.grpc.port}`,
      package: protobufPackage,
      protoPath: resolve('./node_modules/proto-users/users.proto'),
    },
  });
  app.useGlobalPipes(new ValidationPipe({
    errorHttpStatusCode: 422,
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  await app.listen();
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
