import { Body, Controller, Delete, ForbiddenException, Get, Patch, Put, UseInterceptors } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import {
  IRole,
  isSuperiorOrSimilar, IUser,
  Roles,
  UpdateOneRoleOptionDto,
  UserWithEditableRole,
  UpdateUserRoleLabelInputDto,
} from '@biblio-num/shared'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { TargetUserInterceptor } from '@/modules/users/providers/interceptors/target-user.interceptor'
import { RoleService } from '@/modules/users/providers/role.service'
import { AllDemarcheInterceptor } from '@/modules/demarches/providers/interceptors/all-demarche.interceptor'
import {
  TargetUserWithEditableRole,
} from '@/modules/users/providers/decorators/target-user-with-editable-role.decorator'
import { generateRoleAttributionList, isEditionAllowed, isRoleDeletable } from '@/modules/users/utils/role.utils'
import { CurrentUserRole } from '@/modules/users/providers/decorators/current-user-role.decorator'
import { TargetUser } from '@/modules/users/providers/decorators/target-user.decorator'
import { CurrentUser } from '@/modules/users/providers/decorators/current-user.decorator'

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

  @Put()
  async putUserRoleLabel(
    @CurrentUser() editor: IUser,
    @TargetUser() target: IUser,
    @Body() dto: UpdateUserRoleLabelInputDto,
  ): Promise<void> {
    this.logger.verbose('putUserRoleLabel')
    if (!generateRoleAttributionList(editor, target).includes(dto.role)) {
      throw new ForbiddenException(
        'You are not allowed to perform this operation',
      )
    }
    return this.service.updateUserRole(target, {
      label: dto.role,
      options: target.role.options,
    })
  }

  @Delete()
  async deleteUserRole(
    @CurrentUser() editor: IUser,
    @TargetUser() target: IUser,
  ): Promise<void> {
    this.logger.verbose('putUserRoleLabel')
    const roleList = generateRoleAttributionList(editor, target)
    if (!isRoleDeletable(target.role.label, roleList)) {
      throw new ForbiddenException(
        'You are not allowed to perform this operation',
      )
    }
    return this.service.updateUserRole(target, { label: null, options: {} })
  }
}
