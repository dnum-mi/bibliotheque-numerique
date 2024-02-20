import type { ICreateUser } from './create-user.interface'

export interface IResetPasswordInput extends Pick<ICreateUser, 'email'> {}
