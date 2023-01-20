import type { IRole } from './Role.interface'

export interface User {
  id: number;
  firstName?: string;
  lastName?: string;
  email: string;
  roles: IRole[];
}

export type UserForm = {
  email: string;
  password: string;
}

export interface LoginForm {
  password: string;
  email: string;
}
