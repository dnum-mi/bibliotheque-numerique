import { NestFactory } from '@nestjs/core'
import { ConfigService } from '@nestjs/config'

import { add } from '@biblio-num/shared-utils'

import { ApiModule } from './api.module'
import { configMain } from '../../config-main'

console.log(add(1, 2))

async function bootstrap (): Promise<void> {
  const app = await NestFactory.create(ApiModule, {
    cors: true,
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
  await app.listen(configService.get('port'))
}
bootstrap()
