import { IPaginated } from '@biblio-num/shared-utils'

export class PaginatedDto<T> implements IPaginated<T> {
  total: number
  data: Partial<T>[]
}
