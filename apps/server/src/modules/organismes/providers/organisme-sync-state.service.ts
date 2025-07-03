import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'
import { SyncState } from '@/shared/sync-state/objects/entities/sync-state.entity'
import { SyncStateGenericService } from '@/shared/sync-state/services/sync-state-generic.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class OrganismeSyncStateService extends SyncStateGenericService<Organisme> {
  constructor (
    protected readonly logger: LoggerService,
    @InjectRepository(SyncState)
    protected readonly repo: Repository<SyncState>,
    @InjectRepository(Organisme)
    protected readonly repoParent: Repository<Organisme>,
  ) {
    super(logger, repo, repoParent)
    this.logger.setContext(this.constructor.name)
  }

  // #region Pour les Foundations
  async setStateQueuedByIdRnf(idRnf: string): Promise<SyncState> {
    this.logger.verbose('Set to Queued status for rnf')
    return await super.setStateQueued({ idRnf })
  }

  async setStateUploadingByIdRnf(
    idRnf: string,
    syncState?: SyncState['id'],
  ): Promise<SyncState> {
    this.logger.verbose('Set to uploading status for rnf')
    return await super.setStateUploading(
      { idRnf, id: syncState },
      `Foundation ${idRnf} is not found`,
    )
  }

  async setStateUploadedByRnfId(idRnf: string): Promise<SyncState> {
    this.logger.verbose('Set uploaded status of rnf')
    return await super.setStateUploaded(
      { idRnf },
      `Foundation ${idRnf} is not found`,
    )
  }

  async setStateFailedByRnfId(
    idRnf: string,
    error: string,
    syncState?: SyncState['id'],
  ): Promise<SyncState> {
    this.logger.verbose('Set failed status of rnf')
    return await super.setStateFailed(
      error,
      { idRnf, id: syncState },
      `Foundation ${idRnf} is not found`,
    )
  }
  // #endregion Pour les Foundations
}
