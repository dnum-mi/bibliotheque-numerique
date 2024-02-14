import { Injectable } from '@nestjs/common'
import { addDays } from 'date-fns'
import { LoggerService } from '@/shared/modules/logger/logger.service'

@Injectable()
export class WorkerSyncService {
  constructor(private logger: LoggerService) {
    this.logger.setContext(this.constructor.name)
  }

  getOrganismeRnfLastSynchronisedAt(): Promise<Date> {
    this.logger.verbose('getOrganismeLastSynchronisedAt')
    // TODO: retrieve this information from a persistant storage
    return Promise.resolve(
      addDays(new Date(), -1),
    )
  }

  setOrganismeRnfLastSynchronisedAt(date: Date): Promise<void> {
    this.logger.verbose('setOrganismeLastSynchronisedAt')
    // TODO: save this information to a persistant storage
    this.logger.debug(date)
    return Promise.resolve()
  }
}
