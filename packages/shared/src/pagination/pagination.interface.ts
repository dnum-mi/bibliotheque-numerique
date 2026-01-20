import type { ISort } from './sort.interface'
import type { IFilter } from './filter.interface'

export interface IPagination<T> {
  page?: number | 1
  perPage?: number | 20
  columns: ((keyof T) | string)[]
  columnWidthById?: Record<keyof T | string, number>
  sorts: ISort<T>[]
  filters: Record<keyof T, IFilter> | null
}
