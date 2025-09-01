import { Injectable } from '@nestjs/common'
import { JobOptions, Queue } from 'bull'
import { InjectQueue } from '@nestjs/bull'

import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import {
  SyncOneRnaOrganismeJobPayload,
  SyncOneRnfOrganismeJobPayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { SyncState } from '@/shared/sync-state/objects/entities/sync-state.entity'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { OrganismeSyncStateService } from './organisme-sync-state.service'

@Injectable()
export class OrganismeSyncService {
  constructor(
    private readonly logger: LoggerService,
    private readonly syncState: OrganismeSyncStateService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  async addSyncOneRnf(idRnf: string, priority?: number): Promise<SyncState> {
    this.logger.verbose(`Add new RNF with id ${idRnf}`)
    let opt: JobOptions
    if (priority !== undefined) {
      this.logger.debug('set in priority')
      opt = { priority }
    }
    const syncStateEntity = await this.syncState.setStateQueuedByIdRnf(idRnf)
    await this.syncQueue.add(eJobName.SyncOneRnfOrganisme, {
      rnf: idRnf,
      syncState: syncStateEntity.id,
    } as SyncOneRnfOrganismeJobPayload,
    opt)
    return syncStateEntity
  }

  async addSyncOneRna(idRna: string, priority?: number): Promise<SyncState> {
    this.logger.verbose(`Add new RNF with id ${idRna}`)
    let opt: JobOptions
    if (priority !== undefined) {
      this.logger.debug('set in priority')
      opt = { priority }
    }
    const syncStateEntity = await this.syncState.setStateQueuedByIdRna(idRna)
    await this.syncQueue.add(eJobName.SyncOneRnaOrganisme, {
      rna: idRna,
      syncState: syncStateEntity.id,
    } as SyncOneRnaOrganismeJobPayload,
    opt)
    return syncStateEntity
  }
}
