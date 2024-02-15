import { RolesKeys } from '@biblio-num/shared-utils'

export class AgGridUserDto {
  id: number
  firstname: string
  lastname: string
  email: string
  job: string
  roleLabel: RolesKeys
  roleOptionsResume: string
}
