import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.disable('x-powered-by');
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Isti Test Documentation')
    .setDescription('Berisikan endpoint-endpoint yang dimiliki oleh ISTI TEST')
    .setVersion('1.0')
    .addBearerAuth(
      {
        description: 'Input valid credential here',
        type: 'http',
        in: 'Header',
        name: 'Authorization',
        bearerFormat: 'Bearer',
      },
      'authorization-token',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
