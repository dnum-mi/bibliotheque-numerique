import { JoinColumn, OneToOne } from 'typeorm'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { SyncState } from './sync-state.entity'
import { IEntityWithSyncState } from '@biblio-num/shared'

export abstract class BaseEntitySyncState extends BaseEntity implements IEntityWithSyncState {
  @OneToOne(() => SyncState, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ foreignKeyConstraintName: 'FK_JOIN_SYNC_STAT' })
  syncState: SyncState
}
