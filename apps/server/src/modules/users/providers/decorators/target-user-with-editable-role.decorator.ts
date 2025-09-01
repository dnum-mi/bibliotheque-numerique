import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { TARGET_USER_KEY } from '@/modules/users/providers/interceptors/target-user.interceptor'
import { generateUserWithEditableRole } from '@/modules/users/utils/role.utils'
import { ALL_SMALL_DEMARCHE_KEY } from '@/modules/demarches/providers/interceptors/all-demarche.interceptor'

export const TargetUserWithEditableRole = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  const currentUser = request.user
  const targetUser = request[TARGET_USER_KEY]
  const allSmallDemarches = request[ALL_SMALL_DEMARCHE_KEY]
  return generateUserWithEditableRole(currentUser, targetUser, allSmallDemarches)
})
