import { IAddress } from "./address.interface";
import { PersonRoleKey } from "./person-role.enums";

export interface IPerson {
  role: PersonRoleKey,
  createdAt: Date,
  updatedAt: Date,
  civility: string,
  lastName: string,
  firstName: string,
  email: string,
  phone: string,
  profession: string,
  nationality: string,
  bornAt: Date,
  bornPlace: string,
  address: IAddress,
}

