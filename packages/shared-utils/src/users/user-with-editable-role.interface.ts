import type { PrefectureKeys } from '../prefectures'
import type { RolesKeys } from '../roles'
import type { ISmallDemarcheOutput } from '../demarches'
import type { IUserOutput } from './user-output.interface'

export interface IPrefectureOptions {
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
  prefectureOptions: IPrefectureOptions
} & ISmallDemarcheOutput

export interface IUserWithEditableRole {
  originalUser: IUserOutput
  possibleRoles: RolesKeys[]
  deletable: boolean
  demarcheHash: Record<number, OneDemarcheRoleOption>
}
