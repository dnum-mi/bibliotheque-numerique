export class DossierSearchOutputDto {
  total: number
  data: Record<string, string | number | Date | string[] | number[] | Date[]>[]
}
