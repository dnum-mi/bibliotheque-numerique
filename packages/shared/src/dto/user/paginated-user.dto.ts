import { PaginatedDto } from '../pagination'
import { PrefectureKeys, RolesKeys } from '../../enums'

export class UserForAgGridDto {
  id: number
  firstname: string
  lastname: string
  email: string
  job: string
  roleLabel: RolesKeys
  optionResume: string
}

export class PaginatedUserDto extends PaginatedDto<UserForAgGridDto> {}
