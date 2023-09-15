import { Module } from '@nestjs/common'
import { FoundationController } from '@/modules/foundation/controllers/foundation.controller'
import { FoundationService } from '@/modules/foundation/providers/foundation.service'
import { DsModule } from '@/modules/ds/ds.module'
import { FileStorageModule } from '@/modules/file-storage/file-storage.module'

@Module({
  imports: [DsModule, FileStorageModule],
  controllers: [FoundationController],
  providers: [FoundationService],
})
export class FoundationModule {}
