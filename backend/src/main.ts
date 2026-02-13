import * as dotenv from 'dotenv';
import * as path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const result = dotenv.config({ path: envPath });
console.log('[dotenv] path:', envPath);
console.log('[dotenv] error:', result.error?.message ?? 'none');
console.log('[dotenv] keys:', Object.keys(result.parsed || {}));
console.log('[dotenv] BIGTIME_API_TOKEN:', process.env.BIGTIME_API_TOKEN ? 'SET' : 'NOT SET');

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
