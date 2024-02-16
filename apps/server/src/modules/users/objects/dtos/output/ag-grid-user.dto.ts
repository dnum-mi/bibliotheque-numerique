import { IAgGridUser, RolesKeys } from '@biblio-num/shared-utils'

export class AgGridUserDto implements IAgGridUser {
  id: number
  firstname: string
  lastname: string
  email: string
  job: string
  roleLabel: RolesKeys
  roleOptionsResume: string
}
