import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { TARGET_USER_KEY } from '@/modules/users/providers/interceptors/target-user.interceptor'

export const TargetUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request[TARGET_USER_KEY]
})
