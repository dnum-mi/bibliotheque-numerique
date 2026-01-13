import { FilterOperator } from '@primevue/core/api'
import { serverFilterToDataTableFilter, serverFilterToDataTableDataType } from './datatable.const'
import type { BNColDef } from '@/components/datatable/server-side/bn-col-def.interface'
import type { DataTableFilterMeta } from 'primevue/datatable'

export const formatDateForApi = (value: Date | string | null): string | null => {
  if (!value) {
    return null
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day} 00:00:00`
}

export const safeNumber = (val: any): number | null => {
  if (val === null || val === undefined || val === '') {
    return null
  }
  const num = Number(val)
  return Number.isNaN(num) ? null : num
}

export const getFilters = (columnDefs: BNColDef[]): DataTableFilterMeta => {
  return columnDefs
    .filter((col) => col.filterable !== false)
    .reduce((acc, col) => {
      const filterType = typeof col.filter === 'string' ? col.filter : 'agTextColumnFilter'
      return {
        ...acc,
        [col.field!]: {
          operator: FilterOperator.AND,
          constraints: [
            {
              value: null,
              matchMode: serverFilterToDataTableFilter[filterType],
            },
          ],
          fieldType: col.fieldType,
          filterType: serverFilterToDataTableDataType[filterType],
        },
      }
    }, {} as DataTableFilterMeta)
}
