import { IDataTableUser, VerbosePrefecture, RolesKeys } from '@biblio-num/shared'

export class DataTableUserDto implements IDataTableUser {
  id: number
  firstname: string
  lastname: string
  email: string
  job: string
  roleLabel: RolesKeys
  roleOptionsResume: string
  prefecture: VerbosePrefecture
}
