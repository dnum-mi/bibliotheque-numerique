import { IPaginated } from '@biblio-num/shared'

export class PaginatedDto<T> implements IPaginated<T> {
  total: number
  data: Partial<T>[]
}
