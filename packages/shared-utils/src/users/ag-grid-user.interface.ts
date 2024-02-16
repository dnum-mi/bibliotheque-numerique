import type { RolesKeys } from '../roles'

export interface IAgGridUser {
  id: number
  firstname: string
  lastname: string
  email: string
  job: string
  roleLabel: RolesKeys
  roleOptionsResume: string
}
