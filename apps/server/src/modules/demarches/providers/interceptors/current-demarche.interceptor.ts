import { DemarcheService } from '../services/demarche.service'
import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common'
import { from, Observable, switchMap } from 'rxjs'
import { IRole, isBelowSuperAdmin } from '@biblio-num/shared'

const no404 = (): void => {
  throw new NotFoundException('La démarche est introuvable')
}
const no403 = (): void => {
  throw new ForbiddenException('You are not allowed to access this demarche.')
}

@Injectable()
export class CurrentDemarcheInterceptor implements NestInterceptor {
  constructor (private service: DemarcheService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    const id = parseInt(
      context.switchToHttp().getRequest().params.demarcheId || '',
    )
    if (!id) {
      no404()
    }

    return from(
      this.service.findOneById(id),
    ).pipe(
      switchMap((demarche) => {
        if (!demarche) {
          no404()
        }
        const currentUserRole: IRole = context.switchToHttp().getRequest().user?.role
        if (isBelowSuperAdmin(currentUserRole.label) && !currentUserRole.options[demarche.id]) {
          no403()
        }
        context.switchToHttp().getRequest().demarche = demarche
        return next.handle()
      }),
    )
  }
}
