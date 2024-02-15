import type { UserFriendlyFilter } from '../users'

export interface SmallCustomFilterDto {
  id: number
  name: string
  filters: UserFriendlyFilter[]
}
