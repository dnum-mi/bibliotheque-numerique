import { Global, Module } from '@nestjs/common'
import { XlsxService } from '@/shared/modules/xlsx/xlsx.service'

@Global()
@Module({
  providers: [XlsxService],
  exports: [XlsxService],
})
export class XlsxModule {}
