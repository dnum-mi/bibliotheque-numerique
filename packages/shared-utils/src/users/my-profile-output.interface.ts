import type { ISmallDemarcheOutput } from '../demarches'
import type { IRole, IRoleOption, RolesKeys } from '../roles'
import type { IUserOutput } from './user-output.interface'

interface IFrontFriendlyRoleOption extends IRoleOption {
  national: boolean
  prefectures: string[]
  demarche: ISmallDemarcheOutput
}

interface IFrontFriendlyRoleOutput extends IRole {
  label: RolesKeys | null
  options: Record<number, IFrontFriendlyRoleOption>
}

export interface IMyProfileOutput extends Omit<IUserOutput, 'role'> {
  role: IFrontFriendlyRoleOutput
}
