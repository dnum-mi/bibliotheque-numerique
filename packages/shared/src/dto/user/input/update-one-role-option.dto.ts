import { PrefectureKeys } from '../../../enums'

export class UpdateOneRoleOptionDto {
  demarcheId: number
  checked?: boolean
  national?: boolean
  prefectures?:
    | {
        add: PrefectureKeys
      }
    | {
        remove: PrefectureKeys
      }
}
