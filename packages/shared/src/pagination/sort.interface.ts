export interface ISort<T> {
  key: keyof T & string
  order: 'ASC' | 'DESC'
}
