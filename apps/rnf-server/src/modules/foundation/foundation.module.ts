import { forwardRef, Module } from '@nestjs/common'
import { FoundationController } from '@/modules/foundation/controllers/foundation.controller'
import { FoundationService } from '@/modules/foundation/providers/foundation.service'
import { DsModule } from '@/modules/ds/ds.module'
import { FoundationHistoryService } from '@/modules/foundation/providers/foundation-history.service'
import { FileStorageModule } from '@/modules/file-storage/file-storage.module'

@Module({
  imports: [forwardRef(() => DsModule), FileStorageModule],
  controllers: [FoundationController],
  providers: [FoundationService, FoundationHistoryService],
  exports: [FoundationService],
})
export class FoundationModule {}
