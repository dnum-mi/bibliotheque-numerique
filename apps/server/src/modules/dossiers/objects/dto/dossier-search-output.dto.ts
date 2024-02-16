import { IDossierSearchOutput } from '@biblio-num/shared-utils'

export class DossierSearchOutputDto implements IDossierSearchOutput {
  total: number
  data: Record<string, string | number | Date | string[] | number[] | Date[]>[]
}
