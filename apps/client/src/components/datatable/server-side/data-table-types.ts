/**
 * Types pour DataTable
 */

import type {
  SetFilterModel,
  TextFilterModel,
  NumberFilterModel,
  DateFilterModel,
  ICombinedSimpleModel,
} from './filter-model.interface'

export type JoinOperator = 'AND' | 'OR'

export interface IMultiFilterModel {
  filterType: 'multi'
  filterModels?: Array<DateFilterModel | { value: string } | null>
}

export interface ISimpleFilterModel {
  type: string
  filter?: any
  filterTo?: any
}

export interface SortModelItem {
  colId: string
  sort: 'asc' | 'desc'
}

export interface IServerSideGetRowsRequest {
  startRow: number
  endRow: number
  filterModel: Record<string, any>
  sortModel: SortModelItem[]
}

export interface IServerSideGetRowsParams {
  request: IServerSideGetRowsRequest
  success: (params: { rowData: any[]; rowCount: number }) => void
  fail: () => void
}

export type GridFilterModel = Record<string, SetFilterModel | TextFilterModel | NumberFilterModel | DateFilterModel | ICombinedSimpleModel<any> | IMultiFilterModel | any>

export interface GridOptions {
  localeText?: Record<string, string>
  suppressMenuHide?: boolean
  rowModelType?: string
  serverSideDatasource?: { getRows: (params: IServerSideGetRowsParams) => void }
  serverSideSortOnServer?: boolean
  serverSideFilterOnServer?: boolean
  pagination?: boolean
  defaultColDef?: Record<string, any>
  rowSelection?: string
  paginationPageSize?: number
  cacheBlockSize?: number
  components?: Record<string, any>
  sideBar?: {
    toolPanels: Array<{
      id: string
      labelDefault: string
      labelKey: string
      iconKey: string
      toolPanel: string
      toolPanelParams?: Record<string, boolean>
    }>
    hiddenByDefault: boolean
  }
}

/**
 * Params pour les cell renderers
 */
export interface ICellRendererParams {
  value: any
  data?: any
  node?: any
  colDef?: any
  [key: string]: any
}

/**
 * Params pour les filtres
 */
export interface IFilterParams {
  api: any
  colDef: any
  column: any
  filterChangedCallback: () => void
  [key: string]: any
}

/**
 * Params pour les filtres de type Set
 */
export interface ISetFilterParams {
  values?: any[]
  cellRenderer?: any
  valueFormatter?: (params: { value: any }) => string
  suppressSelectAll?: boolean
  [key: string]: any
}

/**
 * Fonction de formatage de valeur
 */
export type ValueFormatterFunc<TData = any, TValue = any> = (params: ValueFormatterParams<TData, TValue>) => string

/**
 * Params pour le formatage de valeur
 */
export interface ValueFormatterParams<TData = any, TValue = any> {
  value: TValue
  data?: TData
  node?: any
  colDef?: any
  [key: string]: any
}
