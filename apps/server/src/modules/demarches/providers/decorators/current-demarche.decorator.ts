import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const DemarcheParam = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.params?.demarche
})
