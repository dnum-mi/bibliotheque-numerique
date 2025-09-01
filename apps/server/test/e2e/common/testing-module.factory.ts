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

export type Tokens = Record<RolesKeys | 'norole', string>

export class TestingModuleFactory {
  app: INestApplication
  mailerService = mailerServiceMock
  _tokens: Tokens
  _queues: Record<QueueNameKeys, Queue>

  readonly emailInstructor: string = 'instructor1@localhost.com'

  get tokens(): Tokens {
    return this._tokens
  }

  get syncQueue(): Queue {
    return this._queues[QueueName.sync]
  }

  get fileQueue(): Queue {
    return this._queues[QueueName.file]
  }

  /* eslint-disable max-len */
  private async _setTokens(): Promise<void> {
    this._tokens = {
      sudo: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjgxNiwiZW1haWwiOiJzdWRvQGxvY2FsaG9zdC5jb20iLCJpYXQiOjE3NDM0MTMzNjIsImV4cCI6ODA1ODM0MTMzNjJ9.fg4RcgF8Zxp-GlyAqat7Z85GV0-58X6_l6e7QdtHuSo',
      superadmin: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjgxNywiZW1haWwiOiJzdXBlcmFkbWluQGxvY2FsaG9zdC5jb20iLCJpYXQiOjE3NDM0MTMzOTAsImV4cCI6ODA1ODM0MTMzOTB9.XeEFRQAvKPrFY9S5xG1PPhGfSK6HPsBG1YAtNxDV_rU',
      admin: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjgxOSwiZW1haWwiOiJhZG1pbjFAbG9jYWxob3N0LmNvbSIsImlhdCI6MTc0MzQxMzA5MywiZXhwIjo4MDU4MzQxMzA5M30.milriqAgmFH-uR5F1GxCt0DEDoc7Hiy27eBU2uWbPKg',
      instructor: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjgyMCwiZW1haWwiOiJpbnN0cnVjdG9yMUBsb2NhbGhvc3QuY29tIiwiaWF0IjoxNzQzNDEzNDE5LCJleHAiOjgwNTgzNDEzNDE5fQ.LdgnTXvpfbi0Hyapu2XDLZndybYNHi50uOCGfQ0AElE',
      norole: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjgxOCwiZW1haWwiOiJub3JvbGVAbG9jYWxob3N0LmNvbSIsImlhdCI6MTc0MzQxMzQ0NywiZXhwIjo4MDU4MzQxMzQ0N30.MKV0oftUs2mcSStBEJOjWQf2m4sAZ0peZrXl7GhHZWM',
    } as Tokens
  }
  /* eslint-enable max-len */

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
    await this._setTokens()
    this._queues = {
      [QueueName.file]: this.app.get<Queue>(`BullQueue_${QueueName.file}`),
      [QueueName.sync]: this.app.get<Queue>(`BullQueue_${QueueName.sync}`),
    }
  }
}
