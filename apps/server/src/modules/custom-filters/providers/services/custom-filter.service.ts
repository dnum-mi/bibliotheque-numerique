import { Injectable } from '@nestjs/common'
import { Repository } from 'typeorm'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { InjectRepository } from '@nestjs/typeorm'
import { CustomFilter } from '@/modules/custom-filters/objects/entities/custom-filter.entity'

@Injectable()
export class CustomFilterService extends BaseEntityService<CustomFilter> {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(CustomFilter)
    protected readonly repo: Repository<CustomFilter>,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }
}
