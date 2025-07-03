import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SyncState } from './objects/entities/sync-state.entity'
import { SyncStateService } from './services/sync-state.service'
import { SyncStateController } from './controllers/sync-state.controller'

@Module({
  imports: [TypeOrmModule.forFeature([SyncState])],
  controllers: [SyncStateController],
  providers: [SyncStateService],
  exports: [SyncStateService],
})
export class SyncStateModule {}
