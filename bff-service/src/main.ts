import { NestFactory } from '@nestjs/core';

import helmet from 'helmet';
import 'dotenv/config';

import { AppModule } from './app.module';

const port = process.env.PORT || 4000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (req, callback) => callback(null, true),
  });
  app.use(helmet());

  await app.listen(port);
}

bootstrap().then(() => {
  console.log(`Server started on http://localhost:${port}`);
});
