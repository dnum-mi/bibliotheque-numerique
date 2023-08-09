import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'
import { configMain } from './config-main'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    cors: true,
  })

  if (process.env.NODE_ENV !== 'production') {
    const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger')

    const config = new DocumentBuilder()
      .setTitle('Bibliothèque numérique API ')
      .setDescription('Bibliothèque numérique API documentation')
      .setVersion('1.0')
      .setBasePath('/api')
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('swagger', app, document)
  }
  await configMain(app)
  const configService = app.get(ConfigService)
  await app.listen(configService.get('port'))
}
bootstrap()
