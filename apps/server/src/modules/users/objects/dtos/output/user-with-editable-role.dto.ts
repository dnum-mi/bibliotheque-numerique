import type { OneDemarcheRoleOption, RolesKeys } from '@biblio-num/shared'
import { UserOutputDto } from './user-output.dto'
import { IUserWithEditableRole } from '@biblio-num/shared'

export class UserWithEditableRole implements IUserWithEditableRole {
  originalUser: UserOutputDto
  possibleRoles: RolesKeys[]
  deletable: boolean
  demarcheHash: Record<number, OneDemarcheRoleOption>
}
