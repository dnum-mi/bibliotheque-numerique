import { DemarcheService } from '../services/demarche.service'
import {
  CallHandler,
  ExecutionContext,
  Injectable, NestInterceptor,
  NotFoundException,
} from '@nestjs/common'
import { from, Observable, switchMap } from 'rxjs'

@Injectable()
export class CurrentDemarcheInterceptor implements NestInterceptor {
  constructor (private service: DemarcheService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    const no = (): void => {
      throw new NotFoundException('No demarche with this id')
    }
    const id = parseInt(
      context.switchToHttp().getRequest().params.demarcheId || '',
    )
    if (!id) {
      no()
    }

    return from(
      this.service.repository
        .findOne({ where: { id }, select: ['id', 'mappingColumns'] }),
    ).pipe(
      switchMap((demarche) => {
        if (!demarche) {
          no()
        }
        context.switchToHttp().getRequest().demarche = demarche
        return next.handle()
      }),
    )
  }
}
