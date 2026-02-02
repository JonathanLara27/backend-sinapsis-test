import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Callback, Context, Handler } from 'aws-lambda';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

const serverlessExpress = require('@vendia/serverless-express');

// 🟢 Variable global para cachear el servidor (Evita el Cold Start en invocaciones seguidas)
let server: Handler;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api'); 
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));
  
  app.enableCors();
  const configService = app.get(ConfigService);

  const currentStage = configService.get<string>('STAGE') || 'dev';
  const config = new DocumentBuilder()
    .setTitle(configService.get<string>('SWAGGER_TITLE') || 'Sinapsis API')
    .setDescription(configService.get<string>('SWAGGER_DESCRIPTION') || 'Docs')
    .setVersion(configService.get<string>('SWAGGER_VERSION') || '1.0')
    .addServer(`/${currentStage}`)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath = configService.get<string>('SWAGGER_PATH') || 'api/docs';
  SwaggerModule.setup(swaggerPath, app, document);

  await app.init();

  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (
  event: any,
  context: Context,
  callback: Callback,
) => {
  server = server ?? (await bootstrap());
  return server(event, context, callback);
};