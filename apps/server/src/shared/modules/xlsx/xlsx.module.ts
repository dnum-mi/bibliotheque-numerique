import { Global, Module } from '@nestjs/common'
import { XlsxService } from '@/shared/modules/xlsx/xlsx.service'
import { FileModule } from '@/modules/files/file.module'

@Global()
@Module({
  imports: [FileModule],
  providers: [XlsxService],
  exports: [XlsxService],
})
export class XlsxModule {}
