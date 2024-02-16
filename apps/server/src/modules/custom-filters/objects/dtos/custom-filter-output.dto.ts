import { SortDto } from '@/shared/pagination/sort.dto'
import { DynamicKeys } from '@biblio-num/shared-utils'
import { FilterDto } from '@/shared/pagination/filters'

export class CustomFilterOutputDto {
  id: number
  name: string
  groupByDossier: boolean
  columns: string[]
  sorts: SortDto<DynamicKeys>[] | null
  filters: Record<keyof DynamicKeys, FilterDto> | null
  demarcheId: number
  totals: string[] | null
}
