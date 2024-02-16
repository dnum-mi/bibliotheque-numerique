import type { IRole } from '../roles'
import type { ICreateUser } from './create-user.interface'

export interface IUserOutput extends Omit<ICreateUser, 'password'> {
  id: number
  updatedAt: Date
  createdAt: Date
  role: IRole
}
