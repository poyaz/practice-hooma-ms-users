import {Command, CommandRunner} from 'nest-commander';
import {TypeOrmOptionsFactory} from '@nestjs/typeorm';
import {DataSource} from 'typeorm';
import {DataSourceOptions} from 'typeorm/data-source/DataSourceOptions';
import {spawn} from 'child_process';

@Command({name: 'migration:run', description: 'Run migration file in database'})
export class MigrationRunCommand extends CommandRunner {
  constructor(
    private readonly _dataSourceFactory: TypeOrmOptionsFactory,
  ) {
    super();
  }

  async run(passedParams: string[], options?: Record<string, any>): Promise<void> {
    const dataSource = new DataSource(this._dataSourceFactory.createTypeOrmOptions() as DataSourceOptions);
    const source = await dataSource.initialize();
    await source.runMigrations();
    process.exit(0);
  }
}

@Command({name: 'migration:undo', description: 'Run migration file in database'})
export class MigrationUndoCommand extends CommandRunner {
  constructor(
    private readonly _dataSourceFactory: TypeOrmOptionsFactory,
  ) {
    super();
  }

  async run(passedParams: string[], options?: Record<string, any>): Promise<void> {
    const dataSource = new DataSource(this._dataSourceFactory.createTypeOrmOptions() as DataSourceOptions);
    const source = await dataSource.initialize();
    await source.undoLastMigration();
    process.exit(0);
  }
}
