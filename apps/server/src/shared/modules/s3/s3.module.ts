import fileConfig from '@/config/file.config'
import {
  ConfigModule,
  ConfigModuleOptions,
} from '@nestjs/config'
import { Module } from '@nestjs/common'
import { S3Service } from '@/shared/modules/s3/s3.service'
import { BnConfigurationModule } from '@/shared/modules/bn-configurations/bn-configuration.module'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [fileConfig],
    } as ConfigModuleOptions),
    BnConfigurationModule,
    HttpModule,
  ],
  controllers: [],
  providers: [S3Service],
  exports: [S3Service],
})
export class S3Module {}
