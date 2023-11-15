import { Body, Controller, ForbiddenException, Get, Patch, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import {
  IRole,
  isSuperiorOrSimilar,
  Roles,
  UpdateOneRoleOptionDto,
  UserWithEditableRole,
} from '@biblio-num/shared'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { TargetUserInterceptor } from '@/modules/users/providers/interceptors/target-user.interceptor'
import { RoleService } from '@/modules/users/providers/role.service'
import { AllDemarcheInterceptor } from '@/modules/demarches/providers/interceptors/all-demarche.interceptor'
import {
  TargetUserWithEditableRole,
} from '@/modules/users/providers/decorators/target-user-with-editable-role.decorator'
import { isEditionAllowed } from '@/modules/users/utils/role.utils'
import { CurrentUserRole } from '@/modules/users/providers/decorators/current-user-role.decorator'

export const TARGET_USER_ID_PATH = 'targetUserId'

@ApiTags('Users')
@ApiTags('Roles')
@Role(Roles.admin)
@UseInterceptors(TargetUserInterceptor)
@Controller(`users/:${TARGET_USER_ID_PATH}/role`)
export class UserRoleController {
  constructor(
    private readonly logger: LoggerService,
    private readonly service: RoleService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  @Get()
  @UseInterceptors(AllDemarcheInterceptor)
  async getTargetUserWithEditableRole(
    @TargetUserWithEditableRole() tuwer: UserWithEditableRole,
  ): Promise<UserWithEditableRole> {
    this.logger.verbose('getTargetUserWithEditableRole')
    return tuwer
  }

  @Patch()
  @UseInterceptors(AllDemarcheInterceptor)
  async patchTargetUserWithEditableRole(
    @CurrentUserRole() role: IRole,
    @TargetUserWithEditableRole() tuwer: UserWithEditableRole,
    @Body() dto: UpdateOneRoleOptionDto,
  ): Promise<void> {
    this.logger.verbose('getTargetUserWithEditableRole')
    if (!isSuperiorOrSimilar(role.label, Roles.superadmin) && !isEditionAllowed(dto, tuwer)) {
      throw new ForbiddenException(
        'You are not allowed to perform this operation',
      )
    }
    return this.service.patchOneRole(tuwer, dto)
  }
}
