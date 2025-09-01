import { OmitType } from '@nestjs/swagger'
import { UserOutputDto } from './user-output.dto'
import { IMyProfileOutput, IRole, IRoleOption, RolesKeys, PrefectureKey } from '@biblio-num/shared'
import { SmallDemarcheOutputDto } from '@/modules/demarches/objects/dtos/small-demarche-output.dto'

class FrontFriendlyRoleOptionDto implements IRoleOption {
  national: boolean
  prefectures: PrefectureKey[]
  demarche: SmallDemarcheOutputDto
}

class FrontFriendlyRoleOutputDto implements IRole {
  label: RolesKeys | null
  options: Record<number, FrontFriendlyRoleOptionDto>
}

export class MyProfileOutputDto extends OmitType(UserOutputDto, ['role']) implements IMyProfileOutput {
  role: FrontFriendlyRoleOutputDto
}
