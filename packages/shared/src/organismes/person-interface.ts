import { IAddress } from "./address.interface";
import { PersonRoleKey } from "./person-role.enums";

export interface IPerson extends IPersonBase{
  role?: PersonRoleKey,
}

export interface IPersonBase {
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
  isFounder: boolean,
  address: IAddress,
  entryDate?: Date,
  exitDate?: Date;
  jobPosition: string;
}
