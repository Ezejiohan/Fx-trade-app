import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Application entrypoint. Loads environment, creates Nest app and starts HTTP server.
async function bootstrap() {
  // Load .env into process.env
  dotenv.config();

  // Create Nest application from root module
  const app = await NestFactory.create(AppModule);

  // Prefix all routes with /api for a simple namespacing convention
  app.setGlobalPrefix('api');

  // Start listening on configured port (default 3000)
  await app.listen(process.env.PORT || 3000);
  console.log(`Server started on port ${process.env.PORT || 3000}`);
}

bootstrap();
