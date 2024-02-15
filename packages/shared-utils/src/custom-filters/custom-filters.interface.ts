import type {
  DynamicKeys,
} from '../common'
import type {
  IFilter,
  ISort,
} from '.'

export interface ICustomFilter {
  id: number
  name: string
  groupByDossier: boolean
  columns: string[]
  sorts: ISort<DynamicKeys>[] | null
  filters: Record<keyof DynamicKeys, IFilter<unknown>> | null
  demarcheId: number
  totals: string[] | null
}
