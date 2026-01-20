import type { IUserFriendlyFilter } from '../users'

export interface ISmallView {
  id: number
  name: string
  filters: IUserFriendlyFilter[]
}
