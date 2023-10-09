import { DynamicKeys, FilterDto, SortDto } from '../dto'

export interface ICustomFilter {
  id: number
  name: string
  groupByDossier: boolean
  columns: string[]
  sorts: SortDto<DynamicKeys>[] | null
  filters: Record<keyof DynamicKeys, FilterDto> | null
  demarcheId: number,
  totals: string[] | null
}
