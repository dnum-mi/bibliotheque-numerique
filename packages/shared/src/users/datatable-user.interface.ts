import type { RolesKeys } from '../roles'
import { VerbosePrefecture } from '../prefectures'

export interface IDataTableUser {
  id: number
  firstname: string
  lastname: string
  email: string
  job: string
  roleLabel: RolesKeys
  roleOptionsResume: string
  prefecture: VerbosePrefecture
}
