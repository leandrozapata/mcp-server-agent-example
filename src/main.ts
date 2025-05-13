import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: '*', // In production, you should specify your frontend URL
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  // Get port from config
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 4000;
  
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
