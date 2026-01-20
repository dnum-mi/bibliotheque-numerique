import type { IRole } from '../roles'
import { VerbosePrefecture } from '../prefectures'
import { IView } from 'views'

export interface IUser {
  id: number
  email: string
  lastname: string
  firstname: string
  job: string | null
  password: string
  role: IRole
  validated: boolean
  views?: IView[]
  updatedAt: Date
  createdAt: Date
  prefecture: VerbosePrefecture
}
