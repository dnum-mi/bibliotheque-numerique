import { DemarcheService } from '../services/demarche.service'
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common'
import { from, Observable, switchMap } from 'rxjs'

export const ALL_SMALL_DEMARCHE_KEY = 'allSmallDemarche'

@Injectable()
export class AllDemarcheInterceptor implements NestInterceptor {
  constructor (private service: DemarcheService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    return from(
      this.service.findAllSmallDemarche(),
    ).pipe(
      switchMap((demarches) => {
        context.switchToHttp().getRequest()[ALL_SMALL_DEMARCHE_KEY] = demarches
        return next.handle()
      }),
    )
  }
}
