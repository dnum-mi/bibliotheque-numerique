import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Patch,
  Put,
  UseInterceptors,
} from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { LoggerService } from '@/shared/modules/logger/logger.service'

import { isSuperiorOrSimilar, IRole, Roles, IUser } from '@biblio-num/shared'
import { Role } from '@/modules/users/providers/decorators/role.decorator'
import { TargetUserInterceptor } from '@/modules/users/providers/interceptors/target-user.interceptor'
import { RoleService } from '@/modules/users/providers/role.service'
import { AllDemarcheInterceptor } from '@/modules/demarches/providers/interceptors/all-demarche.interceptor'
import {
  TargetUserWithEditableRole,
} from '@/modules/users/providers/decorators/target-user-with-editable-role.decorator'
import {
  generateRoleAttributionList,
  isEditionAllowed,
  isRoleDeletable,
} from '@/modules/users/utils/role.utils'
import { CurrentUserRole } from '@/modules/users/providers/decorators/current-user-role.decorator'
import { TargetUser } from '@/modules/users/providers/decorators/target-user.decorator'
import { CurrentUser } from '@/modules/users/providers/decorators/current-user.decorator'
import { UserWithEditableRole } from '@/modules/users/objects/dtos/output'
import {
  UpdateOneRoleOptionDto,
  UpdateUserRoleLabelInputDto,
} from '@/modules/users/objects/dtos/input'
import { UsualApiOperation } from '@/shared/documentation/usual-api-operation.decorator'

export const TARGET_USER_ID_PATH = 'targetUserId'

@ApiTags('Users', 'Roles')
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
  @UsualApiOperation({
    summary: 'Retourne un utilisateur avec ses rôles.',
    method: 'GET',
    minimumRole: Roles.admin,
    responseType: UserWithEditableRole,
    supplement:
      "Le format des rôles retourné exprime la possibilité pour l'utilisateur qui les demande de les modifier" +
      ' ou non en fonction de ses droits. Cette route fournira donc des résultats différents en fonction du rôle de' +
      " l'utilisateur qui la demande.",
  })
  @UseInterceptors(AllDemarcheInterceptor)
  async getTargetUserWithEditableRole(
    @TargetUserWithEditableRole() tuwer: UserWithEditableRole,
  ): Promise<UserWithEditableRole> {
    this.logger.verbose('getTargetUserWithEditableRole')
    return tuwer
  }

  @Patch()
  @UsualApiOperation({
    summary: 'Retourne un utilisateur avec ses rôles.',
    method: 'POST',
    minimumRole: Roles.admin,
    responseType: UserWithEditableRole,
    supplement:
      "Le format des rôles retourné exprime la possibilité pour l'utilisateur qui les demande de les modifier" +
      ' ou non en fonction de ses droits. Cette route fournira donc des résultats différents en fonction du rôle de' +
      " l'utilisateur qui la demande.",
  })
  @UseInterceptors(AllDemarcheInterceptor)
  async patchTargetUserWithEditableRole(
    @CurrentUserRole() role: IRole,
    @TargetUserWithEditableRole() tuwer: UserWithEditableRole,
    @Body() dto: UpdateOneRoleOptionDto,
  ): Promise<void> {
    this.logger.verbose('getTargetUserWithEditableRole')
    if (!tuwer.originalUser.role.label) {
      throw new ForbiddenException('Target user need to have a role')
    }
    if (
      !isSuperiorOrSimilar(Roles.superadmin, role.label) &&
      !isEditionAllowed(dto, tuwer)
    ) {
      throw new ForbiddenException(
        'You are not allowed to perform this operation',
      )
    }
    return this.service.patchOneRole(tuwer, dto)
  }

  @Patch('many')
  @UsualApiOperation({
    summary: "Modifie plusieurs roles d'un utilisateur.",
    method: 'POST',
    minimumRole: Roles.admin,
    responseType: UserWithEditableRole,
    supplement:
      "Le format des rôles retourné exprime la possibilité pour l'utilisateur qui les demande de les modifier" +
      ' ou non en fonction de ses droits. Cette route fournira donc des résultats différents en fonction du rôle de' +
      " l'utilisateur qui la demande.",
  })
  @UseInterceptors(AllDemarcheInterceptor)
  async patchTargetUserWithEditableRoles(
    @CurrentUserRole() role: IRole,
    @TargetUserWithEditableRole() tuwer: UserWithEditableRole,
    @Body() dtos: UpdateOneRoleOptionDto[],
  ): Promise<void> {
    this.logger.verbose('getTargetUserWithEditableRole')
    if (!tuwer.originalUser.role.label) {
      throw new ForbiddenException('Target user need to have a role')
    }
    if (
      !isSuperiorOrSimilar(Roles.superadmin, role.label) &&
      !dtos.reduce((acc, dto) => acc && isEditionAllowed(dto, tuwer), true)
    ) {
      throw new ForbiddenException(
        'You are not allowed to perform this operation',
      )
    }

    return this.service.patchOneRoles(tuwer, dtos)
  }

  @Put()
  @UsualApiOperation({
    summary: "Modifie les rôle d'un utilisateur.",
    method: 'PUT',
    minimumRole: Roles.admin,
    responseType: null,
  })
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
  @UsualApiOperation({
    summary: "Reset les rôles d'un utilisateur.",
    method: 'DELETE',
    minimumRole: Roles.admin,
    responseType: null,
    supplement:
      "Après cette route, l'utilisateur n'aura plus de rôle." +
      " Les droits de l'utilisateur courant doivent contenir les droits de " +
      "l'utilisateur cible pour effectuer cette opération.",
  })
  async deleteUserRole(
    @CurrentUser() editor: IUser,
    @TargetUser() target: IUser,
  ): Promise<void> {
    this.logger.verbose('putUserRoleLabel')
    const roleList = generateRoleAttributionList(editor, target)
    if (!isRoleDeletable(roleList)) {
      throw new ForbiddenException(
        'You are not allowed to perform this operation',
      )
    }
    return this.service.updateUserRole(target, { label: null, options: {} })
  }
}
