import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import generalConf from './config/general.config'
import logConf from './config/logger.config'
import dsConf from './config/ds.config'
import fileConfig from './config/file.config'
import { LoggerModule } from '@/shared/modules/logger/logger.module'
import { FoundationModule } from '@/modules/foundation/foundation.module'
import { PrismaModule } from '@/shared/modules/prisma/prisma.module'
import { HealthModule } from './modules/health/health.module'
import { FileStorageModule } from '@/modules/file-storage/file-storage.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [generalConf, logConf, dsConf, fileConfig],
    }),
    LoggerModule,
    PrismaModule,
    FoundationModule,
    HealthModule,
    FileStorageModule,
  ],
})
export class AppModule {}
