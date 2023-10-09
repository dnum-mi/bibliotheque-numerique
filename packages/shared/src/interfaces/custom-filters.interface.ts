import { DynamicKeys, FilterDto, SortDto } from '../dto'

export interface ICustomFilter {
  id: number
  name: string
  groupByDossier: boolean
  columns: string[]
  sorts?: SortDto<DynamicKeys>[]
  filters?: Record<keyof DynamicKeys, FilterDto>
  demarcheId?: number,
  totals?: string[]
}
