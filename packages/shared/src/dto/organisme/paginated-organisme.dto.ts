import { IOrganisme } from './organisme.interface'

export class PaginatedOrganismeDto {
  total: number
  data: Partial<IOrganisme>[]
}
