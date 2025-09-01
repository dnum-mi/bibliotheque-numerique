import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentOrganisme = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.organisme
})
