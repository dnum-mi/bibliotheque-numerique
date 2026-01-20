import type { DynamicKeys } from '../common'
import type { IFilter, ISort } from '../pagination'

export interface IView {
  id: number
  name: string
  groupByDossier: boolean
  columns: (string | number | symbol)[]
  columnWidthById?: Record<(string | number | symbol), number>
  sorts: ISort<DynamicKeys>[] | null
  filters: Record<keyof DynamicKeys, IFilter> | null
  demarcheId: number
  totals: string[] | null
}
