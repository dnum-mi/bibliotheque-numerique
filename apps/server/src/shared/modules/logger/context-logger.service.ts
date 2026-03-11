import { Inject, Injectable } from '@nestjs/common'
import { AsyncLocalStorage } from 'async_hooks'
import { ALS_INSTANCE } from '@/shared/modules/als/als.module'
import { AsyncLocalStore } from '@/shared/modules/als/async-local-store.type'
import { iLogPayload } from '@/shared/modules/logger/log-payload.interface'

@Injectable()
export class ContextLoggerService {
  constructor(
    @Inject(ALS_INSTANCE)
    private readonly als?: AsyncLocalStorage<AsyncLocalStore>,
  ) {}

  getStore(): AsyncLocalStore | undefined {
    return this.als?.getStore()
  }

  contextLog(log: iLogPayload): void {
    const store = this.als.getStore()
    if (store && store.job) {
      const formattedTimestamp = new Date(log.timestamp).toLocaleString(
        'fr-FR',
        {
          timeZone: 'Europe/Paris',
          hour12: false,
        },
      )
      const logMessage = `[${formattedTimestamp}] [${log.context}](${log.level}): ${log.message}`
      store.job.log(logMessage)
    }
  }

  extendLogObjectWithStoreValues(
    logObj: Partial<iLogPayload>,
  ): iLogPayload {
    const store = this.getStore()
    const context: Partial<iLogPayload> = {}
    if (store) {
      context.jobDescription = store.job ? `${store.job.name} - ${store.job.id} | ${store.job.getState()}` : undefined
      context.requestId = store.requestId
      const d = store.demarche
      context.demarcheDsId = d?.dsId
      const doss = store.dossier
      context.dossierDsId = doss?.dsDataJson?.number
      const u = store.user
      context.userId = u?.id
      context.userDescription = u
        ? `${u.lastname.toUpperCase()} ${u.firstname.toUpperCase()} @${u.role.label} -- ${u.email} | id:${u.id}`
        : undefined
      context.demarcheDescription = d ? `dnId:${d.dsDataJson.number} | ${d.title} | sqlId:${d.id}` : undefined
      context.dossierDescription = doss
        ? `dnId:${doss.dsDataJson.number} | sqlId:${doss.id} | demarcheId:${doss.demarche.id} | state:${d.state}`
        : undefined
    }
    return {
      ...logObj,
      ...context,
    } as iLogPayload
  }
}
