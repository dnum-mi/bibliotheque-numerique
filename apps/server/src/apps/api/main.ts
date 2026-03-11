import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'
import { ApiModule } from './api.module'
import { configMain } from '../../config-main'
import { LoggerService } from '@/shared/modules/logger/logger.service'

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(ApiModule, {
    cors: true,
    logger: false,
  })

  if (process.env.NODE_ENV !== 'production') {
    const { SwaggerModule, DocumentBuilder } = await import('@nestjs/swagger')

    const config = new DocumentBuilder()
      .setTitle('Bibliothèque numérique API')
      .setDescription('Bibliothèque numérique API documentation')
      .setVersion('1.0')
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('swagger', app, document)
  }
  await configMain(app)
  const configService = app.get(ConfigService)
  const loggerService = await app.resolve(LoggerService)
  const port = configService.get('port')
  app.listen(port)
    .then(() => {
      loggerService.log(`🚀 API SERVER started on ${port}`)
    })
}
bootstrap()
