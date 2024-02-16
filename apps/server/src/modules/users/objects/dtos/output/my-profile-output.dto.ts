import { OmitType } from '@nestjs/swagger'
import { UserOutputDto } from './user-output.dto'
import { IRole, IRoleOption, RolesKeys } from '@biblio-num/shared-utils'
import { SmallDemarcheOutputDto } from '@/modules/demarches/objects/dtos/small-demarche-output.dto'

class FrontFriendlyRoleOptionDto implements IRoleOption {
  national: boolean
  prefectures: string[]
  demarche: SmallDemarcheOutputDto
}

class FrontFriendlyRoleOutputDto implements IRole {
  label: RolesKeys | null
  options: Record<number, FrontFriendlyRoleOptionDto>
}

export class MyProfileOutputDto extends OmitType(UserOutputDto, ['role']) {
  role: FrontFriendlyRoleOutputDto
}
