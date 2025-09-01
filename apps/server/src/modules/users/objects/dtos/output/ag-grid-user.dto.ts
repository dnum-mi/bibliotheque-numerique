import { IAgGridUser, VerbosePrefecture, RolesKeys } from '@biblio-num/shared'

export class AgGridUserDto implements IAgGridUser {
  id: number
  firstname: string
  lastname: string
  email: string
  job: string
  roleLabel: RolesKeys
  roleOptionsResume: string
  prefecture: VerbosePrefecture
}
