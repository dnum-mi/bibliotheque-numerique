import { FindOneOptions, FindOptionsWhere, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'

import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { SyncState } from '../objects/entities/sync-state.entity'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { BaseEntitySyncState } from '../objects/entities/base-entity-sync-state.entity'
import { eState } from '@biblio-num/shared'

@Injectable()
export class SyncStateGenericService<
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
    if (id) {
      entity.syncState = await this.findOneById(id)
    } else {
      entity.syncState = this.repo.create()
    }
    await this._setSyncState(entity.syncState, newSyncState)
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
    const syncState = this.repo.create()
    return await this._setSyncState(syncState, newSyncState)
  }

  private async _setState(stateArg: {
      state: Partial<SyncState>,
      where?: FindOptionsWhere<T>,
      notFoundMessage?: string,
      id?: SyncState['id'],
    }): Promise<SyncState> {
    const { state, where, notFoundMessage, id } = stateArg
    this.logger.verbose(`Set to ${state} status`)
    const entity = await this.findOneParent(where)
    if (!entity) {
      this.logger.warn(notFoundMessage)
      return
    }
    if (!entity.syncState) {
      await this._createAndJoin(entity, state, id)
      return
    }
    await this._setSyncState(entity.syncState, state)
  }

  async setStateUploading(
    where?: FindOptionsWhere<T>,
    notFoundMessage?: string,
    id?: SyncState['id'],
  ): Promise<SyncState> {
    const state: Partial<SyncState> = {
      state: eState.uploading,
      message: '',
    }
    return this._setState(
      {
        state,
        where,
        notFoundMessage,
        id,
      },
    )
  }

  async setStateUploaded(
    where?: FindOptionsWhere<T>,
    notFoundMessage?: string,
  ): Promise<SyncState> {
    const state: Partial<SyncState> = {
      state: eState.uploaded,
      lastSynchronisedAt: new Date(),
      message: null,
    }
    return this._setState(
      {
        state,
        where,
        notFoundMessage,
      },
    )
  }

  async setStateFailed(
    message: string,
    where?: FindOptionsWhere<T>,
    notFoundMessage?: string,
    id?: SyncState['id'],
  ): Promise<SyncState> {
    const state: Partial<SyncState> = {
      state: eState.failed,
      message,
    }
    return this._setState(
      {
        state,
        where,
        notFoundMessage,
        id,
      },
    )
  }
  // #endregion Set status
}
