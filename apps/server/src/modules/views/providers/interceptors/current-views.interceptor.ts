import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { ViewService } from '@/modules/views/providers/services/view.service'
import { from, Observable, switchMap } from 'rxjs'

@Injectable()
export class CurrentViewsInterceptor implements NestInterceptor {
  constructor(private service: ViewService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    const user = context.switchToHttp().getRequest().user
    const where:{ user: { id: number }, demarcheId?: number} = { user: { id: user.id } }

    const demarche = context.switchToHttp().getRequest().demarche
    if (demarche) {
      where.demarcheId = demarche.id
    }
    return from(
      this.service.repository.find({
        where,
        select: ['columns', 'filters', 'columnWidthById',
          'sorts', 'groupByDossier', 'name', 'id', 'demarcheId', 'totals'],
      }),
    ).pipe(
      switchMap((views) => {
        context.switchToHttp().getRequest().views = views
        return next.handle()
      }),
    )
  }
}
