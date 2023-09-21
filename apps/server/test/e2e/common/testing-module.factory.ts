import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '../../../src/app.module'
import { configMain } from '../../../src/config-main'
import { INestApplication } from '@nestjs/common'
import { DsApiClient } from '@dnum-mi/ds-api-client'
import { dsApiClientMock } from '../../mock/ds-api-client/ds-api-client.mock'
import { LoggerService } from '../../../src/shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../mock/logger-service.mock'
import { mailerServiceMock } from '../../mock/mailer-service.mock'
import { MailerService } from '@nestjs-modules/mailer'
import { FileService } from '@/modules/files/providers/file.service'

export class TestingModuleFactory {
  app: INestApplication
  mailerService = mailerServiceMock
  fileService: FileService

  async init (): Promise<void> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(MailerService)
      .useValue(this.mailerService)
      .overrideProvider(DsApiClient)
      .useValue(dsApiClientMock)
      .compile()

    this.app = moduleFixture.createNestApplication()
    configMain(this.app)
    this.fileService = moduleFixture.get<FileService>(FileService)
    await this.app.init()
  }
}
