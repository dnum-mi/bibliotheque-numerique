import type { IView } from '@biblio-num/shared'

export type ViewWithErrors = IView & {
  disabledColumns: string[]
}
