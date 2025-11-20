import type { ColDef } from 'ag-grid-community'

export interface BNColDef extends ColDef {
  fieldType?: string,
  filterable?: boolean, // Uniquement pour PrimeVue DataTable
}
