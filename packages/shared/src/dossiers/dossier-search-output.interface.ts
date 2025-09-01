export interface IDossierSearchOutput {
  total: number
  data: Record<string, string | number | Date | string[] | number[] | Date[]>[]
}
