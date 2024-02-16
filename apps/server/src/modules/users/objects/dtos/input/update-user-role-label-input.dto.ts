import { IUpdateUserRoleLabelInput, RolesKeys } from '@biblio-num/shared-utils'

export class UpdateUserRoleLabelInputDto implements IUpdateUserRoleLabelInput {
  role: RolesKeys
}
