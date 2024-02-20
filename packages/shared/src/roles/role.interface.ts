import type { PrefectureKeys } from '../prefectures'
import type { RolesKeys } from './roles.enum'

export interface IRoleOption {
  national: boolean
  prefectures: PrefectureKeys[]
}

export interface IRole {
  label: RolesKeys | null
  options: Record<number, IRoleOption>
}
