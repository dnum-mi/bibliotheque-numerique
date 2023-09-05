import { DynamicKeys, FilterDto, SortDto } from '../dto'

export interface ICustomFilter {
  name: string
  groupByDossier: boolean
  columns: string[]
  sorts?: SortDto<DynamicKeys>[]
  filters?: Record<keyof DynamicKeys, FilterDto>
}
