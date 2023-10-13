import { RolesKeys } from '../enums'

export interface IRoleOption {
  idDemarche: number;
  national: boolean;
  prefectures: string[];
}

export interface IRole {
  label: RolesKeys | null;
  options: IRoleOption[];
}
