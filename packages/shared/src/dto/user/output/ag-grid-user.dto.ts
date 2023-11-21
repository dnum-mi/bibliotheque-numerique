import { RolesKeys } from '../../../enums'

export class AgGridUserDto {
  id: number
  firstname: string
  lastname: string
  email: string
  job: string
  roleLabel: RolesKeys
  roleOptionsResume: string
}
