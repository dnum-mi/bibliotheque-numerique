/**
 * Définition de colonne pour DataTable
 */
export interface BNColDef {
  // Propriétés de base
  field?: string
  headerName?: string
  hide?: boolean
  width?: number
  colId?: string
  type?: string | string[]

  // Filtres
  filter?: string | boolean
  filterParams?: Record<string, any>
  menuTabs?: string[]
  filterable?: boolean
  suppressHeaderFilterButton?: boolean

  // Renderers
  cellRenderer?: any
  cellRendererParams?: Record<string, any>
  cellStyle?: Record<string, any>

  // Formatters
  valueFormatter?: (params: { value: any }) => string
  valueGetter?: string | ((params: any) => any)

  // Sorting
  sortable?: boolean

  // Autres propriétés
  resizable?: boolean
  autoHeight?: boolean
  suppressHeaderMenuButton?: boolean

  // Propriétés custom
  fieldType?: string
}
