import { PrefectureKeys, RolesKeys } from '../enums'

export interface IRoleOption {
  national: boolean;
  prefectures: PrefectureKeys[];
}

export interface IRole {
  label: RolesKeys | null;
  options: Record<number, IRoleOption>;
}
