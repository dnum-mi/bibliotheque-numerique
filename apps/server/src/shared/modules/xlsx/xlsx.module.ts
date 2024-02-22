import { Global, Module } from '@nestjs/common'
import { XlsxService } from '@/shared/modules/xlsx/xlsx.service'
import { FileModule } from '@/modules/files/file.module'
import { S3Module } from '@/shared/modules/s3/s3.module'
import { BnConfigurationModule } from '@/shared/modules/bn-configurations/bn-configuration.module'

@Global()
@Module({
  imports: [FileModule, S3Module, BnConfigurationModule],
  providers: [XlsxService],
  exports: [XlsxService],
})
export class XlsxModule {}
