import { UserFriendlyFilter } from './user-friendly-filter.interface'

export interface SmallCustomFilterDto {
  id: number
  name: string
  filters: UserFriendlyFilter[]
}
