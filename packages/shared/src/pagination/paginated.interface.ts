export interface IPaginated<T> {
  total: number
  data: Partial<T>[]
}
