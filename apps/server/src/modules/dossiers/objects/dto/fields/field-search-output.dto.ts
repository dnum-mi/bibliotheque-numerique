import { IFieldSearchOutput } from '@biblio-num/shared'

export class FieldSearchOutputDto implements IFieldSearchOutput {
  total: number
  data: Record<string, string | number | Date>[]
}
