import type { PrefectureKeys } from '../prefectures'
import type { RolesKeys } from '../roles'
import type { ISmallDemarcheOutput } from '../demarches'
import type { IUserOutput } from './user-output.interface'

export interface PrefectureOptions {
  national: {
    value: boolean
    editable: boolean
  }
  prefectures: {
    value: PrefectureKeys[]
    deletable: PrefectureKeys[]
    addable: PrefectureKeys[]
  }
}

export type OneDemarcheRoleOption = {
  checked: boolean
  editable: boolean
  prefectureOptions: PrefectureOptions
} & ISmallDemarcheOutput

export interface UserWithEditableRole {
  originalUser: IUserOutput
  possibleRoles: RolesKeys[]
  deletable: boolean
  demarcheHash: Record<number, OneDemarcheRoleOption>
}
