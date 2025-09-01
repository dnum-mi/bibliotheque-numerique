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
    this.logger.verbose(`Set to Queued status for rnf ${idRnf}`)
    return await super.setStateQueued({ idRnf })
  }

  async setStateUploadingByIdRnf(
    idRnf: string,
    syncState?: SyncState['id'],
  ): Promise<SyncState> {
    this.logger.verbose('Set to uploading status for rnf')
    return await super.setStateUploading({
      where: {
        idRnf,
        id: syncState,
      },
      notFoundMessage: `Foundation ${idRnf} is not found`,
      id: syncState,
    })
  }

  async setStateUploadedByRnfId(
    idRnf: string,
    syncState?: SyncState['id'],
  ): Promise<SyncState> {
    this.logger.verbose('Set uploaded status of rnf')
    return await super.setStateUploaded({
      where: { idRnf, id: syncState },
      notFoundMessage: `Foundation ${idRnf} is not found`,
      id: syncState,
    })
  }

  async setStateFailedByRnfId(
    idRnf: string,
    error: string,
    syncState?: SyncState['id'],
  ): Promise<SyncState> {
    this.logger.verbose('Set failed status of rnf')
    return await super.setStateFailed(
      error,
      {
        where: { idRnf, id: syncState },
        notFoundMessage: `Foundation ${idRnf} is not found`,
        id: syncState,
      })
  }
  // #endregion Pour les Foundations

  // #region Pour les assocaitions
  async setStateQueuedByIdRna(idRna: string): Promise<SyncState> {
    this.logger.verbose(`Set to Queued status for rna ${idRna}`)
    return await super.setStateQueued({ idRna })
  }

  async setStateUploadingByIdRna(
    idRna: string,
    syncState?: SyncState['id'],
  ): Promise<SyncState> {
    this.logger.verbose('Set to uploading status for rna')
    return await super.setStateUploading({
      where: {
        idRna,
        id: syncState,
      },
      notFoundMessage: `Associations ${idRna} is not found`,
      id: syncState,
    })
  }

  async setStateUploadedByRnaId(
    idRna: string,
    syncState?: SyncState['id'],
  ): Promise<SyncState> {
    this.logger.verbose('Set uploaded status of rna')
    return await super.setStateUploaded({
      where: { idRna, id: syncState },
      notFoundMessage: `Associations ${idRna} is not found`,
      id: syncState,
    })
  }

  async setStateFailedByRnaId(
    idRna: string,
    error: string,
    syncState?: SyncState['id'],
  ): Promise<SyncState> {
    this.logger.verbose('Set failed status of rna')
    return await super.setStateFailed(
      error,
      {
        where: { idRna, id: syncState },
        notFoundMessage: `Associations ${idRna} is not found`,
        id: syncState,
      })
  }
  // #endregion Pour les Associations
}
