import {CommandFactory} from 'nest-commander';
import {AppModule} from './app.module';

async function bootstrap() {
  process.env.MS_AUTH_BOOTSTRAP = 'cli';

  await CommandFactory.run(AppModule);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
