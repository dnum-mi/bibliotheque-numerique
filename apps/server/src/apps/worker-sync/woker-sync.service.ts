import { Injectable, OnModuleInit } from '@nestjs/common'
import { CustomBullService } from '../../shared/modules/custom-bull/custom-bull.service'
import { LoggerService } from '../../shared/modules/logger/logger.service'

@Injectable()
export class WokerSyncService implements OnModuleInit {
  constructor(
    private readonly logger: LoggerService,
    private readonly customBullService: CustomBullService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  async onModuleInit(): Promise<void> {
    this.logger.verbose('init work sync ')
    await this.customBullService.initkeys()
  }
}
