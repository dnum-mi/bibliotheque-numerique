import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CustomFilters = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().customFilters
})
