export interface Condition {
  filterType?: string
  type?: string
  filter?: string | number | Date | null
  filterTo?: string | number | Date | null
  dateFrom?: string | null
  dateTo?: string | null
  operator?: 'AND' | 'OR'
  conditions?: Condition[]
}
export interface DisplayActiveFilter {
  colId: string
  filterType: 'text' | 'number' | 'date' | 'set' | 'multi' | 'numbers' | 'strings' | string
  type?: string
  filter?: string | number | null | (string | number)[]
  filterTo?: string | number | null
  dateFrom?: string | null
  dateTo?: string | null
  values: any[]
  operator?: 'AND' | 'OR'
  conditions?: Condition[]
  condition1?: Condition
  condition2?: Condition
  filterModels?: DisplayActiveFilter[]
  value?: string | number
  includeEmpty?: boolean
}
export interface AgGridFilterModel {
  [colId: string]: any
}
