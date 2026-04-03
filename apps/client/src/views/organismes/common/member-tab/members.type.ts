import type { RowDataType } from '@/components/datatable/client-side/DataTableClientSide.vue'
import type { IPerson } from '@biblio-num/shared'

export interface IPersonView extends IPerson {
  isExited: boolean
}

export interface IPersonTableRow extends IPersonView, RowDataType {
  fullName?: string
}
