import type { ICustomFilter } from '@biblio-num/shared-utils'

export type CustomFilterWithErrors = ICustomFilter & {
  disabledColumns: string[]
}
