import type { ICustomFilter } from '@biblio-num/shared'

export type CustomFilterWithErrors = ICustomFilter & {
  disabledColumns: string[]
}
