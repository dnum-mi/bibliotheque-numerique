import { RolesKeys } from '../enums'

export interface IRoleOption {
  national: boolean;
  prefectures: string[];
}

export interface IRole {
  label: RolesKeys | null;
  options: Record<number, IRoleOption>;
}
