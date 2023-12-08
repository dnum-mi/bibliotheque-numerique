import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import { configMain } from '@/config-main'
import { INestApplication } from '@nestjs/common'
import { DsApiClient } from '@dnum-mi/ds-api-client'
import { dsApiClientMock } from '../../mock/ds-api-client/ds-api-client.mock'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../mock/logger-service.mock'
import { mailerServiceMock } from '../../mock/mailer-service.mock'
import { MailerService } from '@nestjs-modules/mailer'
import { FileService } from '@/modules/files/providers/file.service'
import { RnfService } from '@/modules/organismes/providers/rnf.service'
import { rnfServiceMock } from '../../mock/rnf-service/rnf-service.mock'
import { RnaService } from '@/modules/organismes/providers/rna.service'
import { rnaServiceMock } from '../../mock/rna-service/rna-service.mock'
import { xlsxServiceMock } from '../../mock/excel-service/excel-service.mock'
import { RolesKeys } from '@biblio-num/shared'
import { getAnyCookie } from './get-any-cookie'
import { XlsxService } from '@/shared/modules/xlsx/xlsx.service'

export type Cookies = Record<RolesKeys | 'norole', string>

export class TestingModuleFactory {
  app: INestApplication
  mailerService = mailerServiceMock
  fileService: FileService
  _cookies: Cookies

  readonly emailInstructor: string = 'instructor1@localhost.com'

  get cookies (): Cookies {
    return this._cookies
  }

  private async _setCookies (): Promise<void> {
    this._cookies = {
      sudo: await getAnyCookie(this.app, 'sudo@localhost.com'),
      superadmin: await getAnyCookie(this.app, 'superadmin@localhost.com'),
      admin: await getAnyCookie(this.app, 'admin1@localhost.com'),
      instructor: await getAnyCookie(this.app, this.emailInstructor),
      norole: await getAnyCookie(this.app, 'norole@localhost.com'),
    } as Cookies
  }

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
      .overrideProvider(RnfService)
      .useValue(rnfServiceMock)
      .overrideProvider(RnaService)
      .useValue(rnaServiceMock)
      .overrideProvider(XlsxService)
      .useValue(xlsxServiceMock)
      .compile()

    this.app = moduleFixture.createNestApplication()
    await configMain(this.app)
    this.fileService = moduleFixture.get<FileService>(FileService)
    await this.app.init()
    await this._setCookies()
  }
}
