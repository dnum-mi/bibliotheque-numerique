import { SortDto } from '@/shared/pagination/sort.dto'
import { DynamicKeys, ICustomFilter, IFilter } from '@biblio-num/shared'

export class CustomFilterOutputDto implements ICustomFilter {
  id: number
  name: string
  groupByDossier: boolean
  columns: string[]
  sorts: SortDto<DynamicKeys>[] | null
  filters: Record<keyof DynamicKeys, IFilter> | null
  demarcheId: number
  totals: string[] | null
}
