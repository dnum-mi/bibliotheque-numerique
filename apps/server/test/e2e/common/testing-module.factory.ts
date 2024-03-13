import { Test, TestingModule } from '@nestjs/testing'
import { ApiModule } from '@/apps/api/api.module'
import { configMain } from '@/config-main'
import { INestApplication } from '@nestjs/common'
import { DsApiClient } from '@dnum-mi/ds-api-client'
import { dsApiClientMock } from '../../mock/ds-api-client/ds-api-client.mock'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../mock/logger-service.mock'
import { mailerServiceMock } from '../../mock/mailer-service.mock'
import { MailerService } from '@nestjs-modules/mailer'
import { RnfService } from '@/modules/organismes/providers/rnf.service'
import { rnfServiceMock } from '../../mock/rnf-service/rnf-service.mock'
import { RnaService } from '@/modules/organismes/providers/rna.service'
import { rnaServiceMock } from '../../mock/rna-service/rna-service.mock'
import { xlsxServiceMock } from '../../mock/excel-service/excel-service.mock'
import { RolesKeys } from '@biblio-num/shared'
import { getAnyCookie } from './get-any-cookie'
import { XlsxService } from '@/shared/modules/xlsx/xlsx.service'
import { S3Service } from '@/shared/modules/s3/s3.service'
import { s3ServiceMock } from '../../mock/s3-service/s3-service.mock'
import {
  QueueName,
  QueueNameKeys,
} from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { Queue } from 'bull'
import { WorkerSyncModule } from '@/apps/worker-sync/worker-sync.module'
import { WorkerFileModule } from '@/apps/worker-file/worker-file.module'

export type Cookies = Record<RolesKeys | 'norole', string>

export class TestingModuleFactory {
  app: INestApplication
  mailerService = mailerServiceMock
  _cookies: Cookies
  _queues: Record<QueueNameKeys, Queue>

  readonly emailInstructor: string = 'instructor1@localhost.com'

  get cookies(): Cookies {
    return this._cookies
  }

  get syncQueue(): Queue {
    return this._queues[QueueName.sync]
  }

  get fileQueue(): Queue {
    return this._queues[QueueName.file]
  }

  private async _setCookies(): Promise<void> {
    this._cookies = {
      sudo: await getAnyCookie(this.app, 'sudo@localhost.com'),
      superadmin: await getAnyCookie(this.app, 'superadmin@localhost.com'),
      admin: await getAnyCookie(this.app, 'admin1@localhost.com'),
      instructor: await getAnyCookie(this.app, this.emailInstructor),
      norole: await getAnyCookie(this.app, 'norole@localhost.com'),
    } as Cookies
  }

  async init(): Promise<void> {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ApiModule,
        WorkerSyncModule,
        WorkerFileModule,
      ],
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
      .overrideProvider(S3Service)
      .useValue(s3ServiceMock)
      .compile()

    this.app = moduleFixture.createNestApplication()
    await configMain(this.app)
    await this.app.init()
    await this._setCookies()
    this._queues = {
      [QueueName.file]: this.app.get<Queue>(`BullQueue_${QueueName.file}`),
      [QueueName.sync]: this.app.get<Queue>(`BullQueue_${QueueName.sync}`),
    }
  }
}
