import { IRole } from './role.interface'
import { ICustomFilter } from './custom-filters.interface'

export interface IUser {
  id: number
  email: string
  lastname: string
  firstname: string
  password: string
  role: IRole
  validated: boolean
  customFilters?: ICustomFilter[]
}
