import { Module } from '@nestjs/common'
import { HubService } from './providers/hub.service'

@Module({
  providers: [HubService],
  exports: [HubService],
})
export class HubModule {}
