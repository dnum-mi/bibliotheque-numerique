import type { PrefectureKeys } from '../prefectures'

export interface IOnePrefectureUpdate {
  toAdd: boolean
  key: PrefectureKeys
}

export interface IUpdateOneRoleOption {
  demarcheId: number
  checked?: boolean
  national?: boolean
  prefecture?: IOnePrefectureUpdate
}
