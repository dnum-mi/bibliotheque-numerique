import { Test, TestingModule } from '@nestjs/testing'
import { AppModule } from '@/app.module'
import { INestApplication } from '@nestjs/common'
import { DsService } from '@/modules/ds/providers/ds.service'
import { dsServiceMock } from '../mocks/ds-service.mock'
import { mainConfig } from '@/main.config'
import { PrismaService } from '@/shared/modules/prisma/providers/prisma.service'
import { LoggerService } from '@/shared/modules/logger/providers/logger.service'
import { loggerServiceMock } from '../mocks/logger-service.mock'
import { FileStorageService } from '@/modules/file-storage/providers/file-storage.service'

interface TestingModuleFactoryOutput {
  app: INestApplication;
  prisma: PrismaService;
  fileStorage: FileStorageService;
}

export const testingModuleFactory = async (): Promise<TestingModuleFactoryOutput> => {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(DsService)
    .useValue(dsServiceMock)
    .overrideProvider(LoggerService)
    .useValue(loggerServiceMock)
    .compile()

  const app = moduleFixture.createNestApplication()
  await mainConfig(app, true)
  const prisma = moduleFixture.get<PrismaService>(PrismaService)
  const fileStorage = moduleFixture.get<FileStorageService>(FileStorageService)
  await app.init()

  return { app, prisma, fileStorage }
}
