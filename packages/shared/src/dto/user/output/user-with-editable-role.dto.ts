import { SmallDemarcheOutputDto } from '../../demarche/small-demarche-output.dto'
import { PrefectureKeys } from '../../../enums'
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

export type OneDemarcheRoleOption = {
  checked: boolean,
  editable: boolean,
  prefectureOptions: prefectureOptions
} & SmallDemarcheOutputDto

export class UserWithEditableRole {
  originalUser: UserOutputDto
  demarcheHash: Record<number, OneDemarcheRoleOption>
}
