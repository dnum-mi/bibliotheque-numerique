import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm'

import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { SyncState } from '../objects/entities/sync-state.entity'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { BaseEntitySyncState } from '../objects/entities/base-entity-sync-state.entity'
import { eState } from '@biblio-num/shared'
import { tArgSetSyncState } from '../arg-sync-state.type'

export abstract class SyncStateGenericService<
  T extends BaseEntitySyncState,
> extends BaseEntityService<SyncState> {
  constructor(
    protected readonly logger: LoggerService,
    protected readonly repo: Repository<SyncState>,
    protected repoParent: Repository<T>,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  private async _setSyncState(
    syncState: SyncState,
    newSyncState: Partial<SyncState>,
  ): Promise<SyncState> {
    this.logger.log('_setSyncState')
    syncState.state = newSyncState.state
    if (newSyncState.lastSynchronisedAt !== undefined) {
      syncState.lastSynchronisedAt = newSyncState.lastSynchronisedAt
    }
    if (newSyncState.message !== undefined) {
      syncState.message = newSyncState.message
    }

    return await this.repo.save(syncState)
  }

  private async _createAndJoin(
    entity: T,
    newSyncState: Partial<SyncState>,
    id?: SyncState['id'],
  ): Promise<SyncState> {
    this.logger.log('_createAndJoin')
    let syncState: SyncState
    if (id) {
      syncState = await this.findOneById(id)
    } else {
      syncState = this.repo.create()
    }
    await this._setSyncState(syncState, newSyncState)
    if (!entity) {
      return syncState
    }
    entity.syncState = syncState
    await this.repoParent.save(entity)
    return entity.syncState
  }

  async findOneParent(where: FindOptionsWhere<T>): Promise<T> {
    const entity = await this.repoParent.findOne({
      where,
      relations: {
        syncState: true,
      },
      select: ['syncState'],
    } as FindOneOptions)

    return entity
  }

  // #region Set status
  async setStateQueued(
    where?: FindOptionsWhere<T>,
    message?: string,
  ): Promise<SyncState> {
    this.logger.verbose('Set to queued status')
    const newSyncState: Partial<SyncState> = {
      state: eState.queued,
      message: message || '',
    }
    const entity = await this.findOneParent(where)

    if (!entity?.syncState) {
      return await this._createAndJoin(entity, newSyncState)
    }
    return await this._setSyncState(entity.syncState, newSyncState)
  }

  private async _setState(stateArg: { state: Partial<SyncState> } & tArgSetSyncState<T>): Promise<SyncState> {
    const { state, where, notFoundMessage, id } = stateArg
    this.logger.verbose(`Set to ${state} status`)
    const entity = await this.findOneParent(where)
    if (!entity) {
      this.logger.warn(notFoundMessage)
      // return
    }
    if (!entity?.syncState) {
      return await this._createAndJoin(entity, state, id)
    }
    return await this._setSyncState(entity?.syncState, state)
  }

  async setStateUploading(args: tArgSetSyncState<T>): Promise<SyncState> {
    const state: Partial<SyncState> = {
      state: eState.uploading,
      message: null,
    }

    return this._setState(
      {
        state,
        ...args,
      },
    )
  }

  async setStateUploaded(args: tArgSetSyncState<T>): Promise<SyncState> {
    const state: Partial<SyncState> = {
      state: eState.uploaded,
      lastSynchronisedAt: new Date(),
      message: null,
    }
    return this._setState(
      {
        state,
        ...args,
      },
    )
  }

  async setStateFailed(
    message: string,
    args: tArgSetSyncState<T>,
  ): Promise<SyncState> {
    const state: Partial<SyncState> = {
      state: eState.failed,
      message,
    }
    return this._setState(
      {
        state,
        ...args,
      },
    )
  }
  // #endregion Set status
}
