import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common'
import { from, Observable, switchMap } from 'rxjs'
import { UserService } from '@/modules/users/providers/user.service'
import { TARGET_USER_ID_PATH } from '@/modules/users/controllers/user-role.controller'

const no404 = (): void => {
  throw new NotFoundException('No user with this id.')
}

export const TARGET_USER_KEY = 'targetUser'

@Injectable()
export class TargetUserInterceptor implements NestInterceptor {
  constructor (private service: UserService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<void> {
    const id = parseInt(
      context.switchToHttp().getRequest().params[TARGET_USER_ID_PATH] || '',
    )
    if (!id) {
      no404()
    }

    return from(
      this.service.findOneById(id),
    ).pipe(
      switchMap((user) => {
        if (!user) {
          no404()
        }
        context.switchToHttp().getRequest()[TARGET_USER_KEY] = user
        return next.handle()
      }),
    )
  }
}
