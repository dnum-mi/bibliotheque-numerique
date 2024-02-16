import type { IUserFriendlyFilter } from '../users'

export interface ISmallCustomFilter {
  id: number
  name: string
  filters: IUserFriendlyFilter[]
}
