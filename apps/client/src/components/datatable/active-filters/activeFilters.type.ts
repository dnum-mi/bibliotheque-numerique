export interface Condition {
  filterType?: string
  type?: string
  filter?: string | number | (string | number)[] | Date | null
  filterTo?: string | number | Date | null
  matchMode?: string
}
export interface DisplayActiveFilter {
  colId: string
  filterType: 'text' | 'numeric' | 'date' | 'set' | 'boolean' | 'multi' | string
  type?: string
  filter?: string | number | null | (string | number)[]
  filterTo?: string | number | null
  values: any[]
  operator?: 'AND' | 'OR'
  conditions?: Condition[]
  condition1?: Condition
  condition2?: Condition
  value?: string | number
  includeEmpty?: boolean
}
