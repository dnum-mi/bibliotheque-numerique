import type { RolesKeys } from '../roles'
import { VerbosePrefecture } from '../prefectures'

export interface IAgGridUser {
  id: number
  firstname: string
  lastname: string
  email: string
  job: string
  roleLabel: RolesKeys
  roleOptionsResume: string
  prefecture: VerbosePrefecture
}
