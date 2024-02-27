import {
  CallHandler,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common'
import { from, Observable, switchMap } from 'rxjs'
import { IRole, isSuperiorOrSimilar, Roles } from '@biblio-num/shared'
import { OrganismeService } from '@/modules/organismes/providers/organisme.service'

const no404 = (): void => {
  throw new NotFoundException("L'organisme est introuvable")
}
const no403 = (): void => {
  throw new ForbiddenException('You are not allowed to access this organisme.')
}

@Injectable()
export class CurrentOrganismeInterceptor implements NestInterceptor {
  constructor(private service: OrganismeService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    const id = parseInt(
      context.switchToHttp().getRequest().params.organismeId || '',
    )
    if (!id) {
      no404()
    }

    return from(this.service.findOneById(id)).pipe(
      switchMap((organisme) => {
        if (!organisme) {
          no404()
        }
        const currentUserRole: IRole = context.switchToHttp().getRequest().user
          ?.role
        if (isSuperiorOrSimilar(currentUserRole.label, Roles.instructor)) {
          no403()
        }
        context.switchToHttp().getRequest().organisme = organisme
        return next.handle()
      }),
    )
  }
}
