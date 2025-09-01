import type { DynamicKeys } from '../common'
import type { IFilter, ISort } from '../pagination'

export interface ICustomFilter {
  id: number
  name: string
  groupByDossier: boolean
  columns: string[]
  sorts: ISort<DynamicKeys>[] | null
  filters: Record<keyof DynamicKeys, IFilter> | null
  demarcheId: number
  totals: string[] | null
}
