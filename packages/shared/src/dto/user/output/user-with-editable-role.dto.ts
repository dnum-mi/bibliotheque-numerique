import { SmallDemarcheOutputDto } from '../../demarche/small-demarche-output.dto'
import { PrefectureKeys, RolesKeys } from '../../../enums'
import { UserOutputDto } from './user-output.dto'

type PrefectureOptions = {
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
  prefectureOptions: PrefectureOptions
} & SmallDemarcheOutputDto

export class UserWithEditableRole {
  originalUser: UserOutputDto
  possibleRoles: RolesKeys[]
  deletable: boolean
  demarcheHash: Record<number, OneDemarcheRoleOption>
}
