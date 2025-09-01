import type { ISmallDemarcheOutput } from '../demarches'
import type { IRole, IRoleOption, RolesKeys } from '../roles'
import type { IUserOutput } from './user-output.interface'
import { PrefectureKey } from '../prefectures'

interface IFrontFriendlyRoleOption extends IRoleOption {
  national: boolean
  prefectures: PrefectureKey[]
  demarche: ISmallDemarcheOutput
}

interface IFrontFriendlyRoleOutput extends IRole {
  label: RolesKeys | null
  options: Record<number, IFrontFriendlyRoleOption>
}

export interface IMyProfileOutput extends Omit<IUserOutput, 'role'> {
  role: IFrontFriendlyRoleOutput
}
