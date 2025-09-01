import type { PrefectureKey } from '../prefectures'

export interface IOnePrefectureUpdate {
  toAdd: boolean
  key: PrefectureKey
}

export interface IUpdateOneRoleOption {
  demarcheId: number
  checked?: boolean
  national?: boolean
  prefecture?: IOnePrefectureUpdate
}
