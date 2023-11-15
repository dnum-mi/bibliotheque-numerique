import { PrefectureKeys } from '../../../enums'

export class UpdateOneRoleOptionDto {
  demarcheId: number
  checked?: boolean
  national?: boolean
  prefecture?: {
    toAdd: boolean
    key: PrefectureKeys
  }
}
