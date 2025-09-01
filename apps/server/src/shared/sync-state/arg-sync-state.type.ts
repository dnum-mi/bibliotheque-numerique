import { FindOptionsWhere } from 'typeorm'
import { BaseEntitySyncState } from './objects/entities/base-entity-sync-state.entity'
import { SyncState } from './objects/entities/sync-state.entity'

export type tArgSetSyncState<T extends BaseEntitySyncState> = {
  where?: FindOptionsWhere<T>
  notFoundMessage?: string
  id?: SyncState['id']
}
