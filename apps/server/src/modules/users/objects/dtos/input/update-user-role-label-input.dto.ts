import { IUpdateUserRoleLabelInput, RolesKeys } from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateUserRoleLabelInputDto implements IUpdateUserRoleLabelInput {
  @ApiProperty({
    description: 'Intutilé du role à donner',
    enum: ['superadmin', 'admin', 'instructor'],
  })
  role: RolesKeys
}
