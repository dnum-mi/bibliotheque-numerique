import { Inject, Injectable } from '@nestjs/common'
import { AsyncLocalStorage } from 'async_hooks'
import { ALS_INSTANCE } from '@/shared/modules/als/als.module'
import { AsyncLocalStore } from '@/shared/modules/als/async-local-store.type'
import { LogElkFormat } from '@/shared/modules/logger/log-elk-format.interface'

@Injectable()
export class ContextLoggerService {
  constructor(
    @Inject(ALS_INSTANCE)
    private readonly als?: AsyncLocalStorage<AsyncLocalStore>,
  ) {}

  contextLog(log: LogElkFormat): void {
    const store = this.als.getStore()
    if (store && store.job) {
      store.job.log(`[${log.context}](${log.level}): ${log.message}`)
    }
  }
}
