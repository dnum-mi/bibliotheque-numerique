import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { ISyncState, StateKey, eState } from '@biblio-num/shared'

@Entity({ name: 'sync-states' })
export class SyncState extends BaseEntity implements ISyncState {
  @Index()
  @Column({
    type: 'enum',
    enum: eState,
    default: eState.queued,
  })
  state: StateKey

  @Index()
  @Column({
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  lastSynchronisedAt: Date

  @Column({
    nullable: true,
  })
  message: string
}
