import { ValidationPipe } from '@nestjs/common';
import { NestFactory }    from '@nestjs/core';
import * as cookieParser   from 'cookie-parser';
import { AppModule }       from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
