import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { CustomFilterService } from '@/modules/custom-filters/providers/services/custom-filter.service'
import { from, Observable, switchMap } from 'rxjs'

@Injectable()
export class CurrentCustomFiltersInterceptor implements NestInterceptor {
  constructor(private service: CustomFilterService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    const user = context.switchToHttp().getRequest().user
    return from(
      this.service.repository.find({
        where: { user: { id: user.id } },
        select: ['columns', 'filters', 'sorts', 'groupByDossier', 'name', 'id'],
      }),
    ).pipe(
      switchMap((filters) => {
        context.switchToHttp().getRequest().customFilters = filters
        return next.handle()
      }),
    )
  }
}
