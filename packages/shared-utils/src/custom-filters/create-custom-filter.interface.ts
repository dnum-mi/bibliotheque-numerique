import type { ICustomFilter } from './custom-filters.interface'

export interface ICreateCustomFilter
  extends Omit<ICustomFilter, 'id' | 'demarcheId'> {
  id: number
  demarcheId?: number | undefined
  name: string
  groupByDossier: boolean
  totals: string[] | null
}
