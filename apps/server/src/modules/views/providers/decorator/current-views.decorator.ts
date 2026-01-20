import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const Views = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().views
})
