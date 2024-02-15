import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Injectable } from '@nestjs/common'
import {
  IUser,
  UpdateOneRoleOptionDto,
  UserWithEditableRole,
} from '@biblio-num/shared'
import {
  IRole,
  Roles,
} from '@biblio-num/shared-utils'
import { UserService } from '@/modules/users/providers/user.service'

@Injectable()
export class RoleService {
  constructor(
    private readonly logger: LoggerService,
    private readonly userService: UserService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  public async updateUserRole(user: IUser, role: IRole): Promise<void> {
    if (role.label === Roles.superadmin) {
      role.options = {}
    }
    await this.userService.updateOrThrow(user.id, { role })
  }

  public async patchOneRole(
    uwer: UserWithEditableRole,
    dto: UpdateOneRoleOptionDto,
  ): Promise<void> {
    this.logger.verbose('patchOneRole')
    const role = uwer.originalUser.role
    if (dto.checked === false) {
      role.options[dto.demarcheId] = undefined
    } else if (dto.checked === true) {
      role.options[dto.demarcheId] = {
        national: false,
        prefectures: [],
      }
    } else if (dto.national === true) {
      role.options[dto.demarcheId] = {
        national: true,
        prefectures: [],
      }
    } else if (dto.national === false) {
      role.options[dto.demarcheId].national = false
    } else if (dto.prefecture?.toAdd) {
      role.options[dto.demarcheId].prefectures.push(dto.prefecture.key)
    } else if (!dto.prefecture?.toAdd) {
      role.options[dto.demarcheId].prefectures = role.options[
        dto.demarcheId
      ].prefectures.filter((key) => key !== dto.prefecture.key)
    }
    await this.userService.repository.update(
      { id: uwer.originalUser.id },
      { role },
    )
  }
}
