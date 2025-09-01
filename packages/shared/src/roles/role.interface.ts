import type { PrefectureKey } from '../prefectures'
import type { RolesKeys } from './roles.enum'

export interface IRoleOption {
  national: boolean
  prefectures: PrefectureKey[]
}

export interface IRole {
  label: RolesKeys | null
  options: Record<number, IRoleOption>
}
