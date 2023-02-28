import {Module} from '@nestjs/common';
import {MigrationRunCommand, MigrationUndoCommand} from './migration/migration.command';
import {PgConfigService} from '@src-loader/database/pg-config.service';

@Module({
  providers: [
    {
      provide: MigrationRunCommand,
      useFactory: (connection) => {
        return new MigrationRunCommand(connection);
      },
      inject: [PgConfigService],
    },
    {
      provide: MigrationUndoCommand,
      useFactory: (connection) => {
        return new MigrationUndoCommand(connection);
      },
      inject: [PgConfigService],
    },
  ],
})
export class CommandModule {
}
