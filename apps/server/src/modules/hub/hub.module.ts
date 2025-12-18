import { Module } from '@nestjs/common'
import { HubService } from './providers/hub.service'
import { HubController } from '@/modules/hub/controllers/hub.controller'

@Module({
  providers: [HubService],
  controllers: [HubController],
  exports: [HubService],
})
export class HubModule {}
