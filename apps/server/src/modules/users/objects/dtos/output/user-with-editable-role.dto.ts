import { SmallDemarcheOutputDto } from '../../../../demarches/objects/dtos/small-demarche-output.dto'
import type { PrefectureKeys, RolesKeys } from '@biblio-num/shared-utils'
import { UserOutputDto } from './user-output.dto'

export type PrefectureOptions = {
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
