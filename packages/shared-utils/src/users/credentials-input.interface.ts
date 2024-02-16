// May change in the future, but for now, it is just like the ICreateUser class
import type { ICreateUser } from './create-user.interface'

export interface ICredentialsInput extends Pick<ICreateUser, 'email'> {
  password: string
}
