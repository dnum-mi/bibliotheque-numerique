import { IUpdateUserRoleLabelInput, RolesKeys } from '@biblio-num/shared'

export class UpdateUserRoleLabelInputDto implements IUpdateUserRoleLabelInput {
  role: RolesKeys
}
