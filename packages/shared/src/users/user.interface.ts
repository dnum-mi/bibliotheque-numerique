import type { IRole } from '../roles'
import type { ICustomFilter } from '../custom-filters'
import { VerbosePrefecture } from '../prefectures'

export interface IUser {
  id: number
  email: string
  lastname: string
  firstname: string
  job: string | null
  password: string
  role: IRole
  validated: boolean
  customFilters?: ICustomFilter[]
  updatedAt: Date
  createdAt: Date
  prefecture: VerbosePrefecture
}
