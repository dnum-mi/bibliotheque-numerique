export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export type UserForm = Partial<User>

export interface LoginForm {
  password: string;
  email: string;
}
