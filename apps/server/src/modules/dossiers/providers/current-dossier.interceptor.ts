import {
  CallHandler,
  ExecutionContext,
  ForbiddenException, Inject,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common'
import { from, Observable, switchMap } from 'rxjs'
import { IRole, isAtLeastInstructor } from '@biblio-num/shared'
import { DossierService } from '@/modules/dossiers/providers/dossier.service'
import { AsyncLocalStorage } from 'async_hooks'
import { ALS_INSTANCE } from '@/shared/modules/als/als.module'
import { AsyncLocalStore } from '@/shared/modules/als/async-local-store.type'

const no404 = (): void => {
  throw new NotFoundException('Le dossier est introuvable')
}
const no403 = (): void => {
  throw new ForbiddenException('You are not allowed to access this dossier.')
}

@Injectable()
export class CurrentDossierInterceptor implements NestInterceptor {
  constructor(
    private service: DossierService,
    @Inject(ALS_INSTANCE)
    private readonly als: AsyncLocalStorage<AsyncLocalStore>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    const id = parseInt(
      context.switchToHttp().getRequest().params.dossierId || '',
    )
    if (!id) {
      no404()
    }

    return from(this.service.findOneById(id)).pipe(
      switchMap((dossier) => {
        if (!dossier) {
          no404()
        }
        const currentUserRole: IRole = context.switchToHttp().getRequest().user
          ?.role
        if (!isAtLeastInstructor(currentUserRole.label)) {
          no403()
        }
        context.switchToHttp().getRequest().dossier = dossier
        const store = this.als.getStore()
        if (store) {
          store.dossier = dossier
        }
        return next.handle()
      }),
    )
  }
}
