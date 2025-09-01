import type { ICreateUser } from './create-user.interface'

export interface IUpdateProfile
  extends Partial<Omit<ICreateUser, 'email' | 'password'>> {}
