import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {UsersController} from './api/grpc/controller/users/users.controller';
import {UuidIdentifier} from './infrastructure/system/uuid-identifier';
import {DateTime} from './infrastructure/system/date-time';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [
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
