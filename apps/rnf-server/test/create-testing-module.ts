import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import { DsService } from '@/modules/ds/providers/ds.service'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { mainConfig } from '@/main.config'
import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'
import { INestApplication } from '@nestjs/common'
import { dsServiceMock } from './mocks/ds-service.mock'
import { loggerServiceMock } from './mocks/logger-service.mock'

export const createTestingModule = async (): Promise<{
  app: INestApplication;
  prisma: PrismaService;
}> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DsService)
    .useValue(dsServiceMock)
    .overrideProvider(LoggerService)
    .useValue(loggerServiceMock)
    .compile()

  const app = moduleFixture.createNestApplication()
  await mainConfig(app)
  const prisma = moduleFixture.get<PrismaService>(PrismaService)
  await app.init()
  return { app, prisma }
}
