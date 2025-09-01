import { Injectable } from '@nestjs/common'
import { BaseEntityService } from '../../base-entity/base-entity.service'
import { SyncState } from '../objects/entities/sync-state.entity'
import { LoggerService } from '../../modules/logger/logger.service'
import { Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class SyncStateService extends BaseEntityService<SyncState> {
  constructor(
    protected readonly logger: LoggerService,
    @InjectRepository(SyncState)
    protected readonly repo: Repository<SyncState>,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }
}
