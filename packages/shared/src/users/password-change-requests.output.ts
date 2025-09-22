import { ICreateUser } from "./create-user.interface";

export interface IPasswordChangeRequestsOutput extends Pick<ICreateUser, 'firstname' | 'lastname' | 'email' | 'prefecture'> {
  id: number
  passwordChangeRequestedAt: Date
}
