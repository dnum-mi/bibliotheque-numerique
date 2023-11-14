import { OrganismeTypeKeys, PrefectureKeys } from '../../../enums'
import { UserOutputDto } from './user-output.dto'

type prefectureOptions = {
  national: {
    value: boolean
    editable: boolean
  },
  prefectures: {
    value: PrefectureKeys[],
    deletable: PrefectureKeys[],
    addable: PrefectureKeys[]
  }
}

export class UserForAdminOutputDto {
  originalUser: UserOutputDto
  demarcheHash: Record<number, {
    id: number,
    checked: boolean,
    label: string,
    types: OrganismeTypeKeys[],
    prefectureOptions: prefectureOptions
  }>
}
