import { VerbosePrefecture } from '../prefectures'

export interface ICreateUser {
  firstname: string
  lastname: string
  job: string
  email: string
  password: string
  prefecture: VerbosePrefecture
}
