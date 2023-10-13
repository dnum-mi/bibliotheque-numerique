export class PaginatedDto<T> {
  total: number
  data: Partial<T>[]
}
