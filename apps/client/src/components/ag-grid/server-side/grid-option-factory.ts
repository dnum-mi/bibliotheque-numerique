import { localeTextAgGrid } from '@/components/ag-grid/agGridOptions'
import type { GridOptions } from 'ag-grid-community'

export const gridOptionFactory = (getRows: (params: any) => void, pageSize:number): GridOptions => ({
  domLayout: 'autoHeight',
  localeText: localeTextAgGrid,
  suppressMenuHide: true,
  rowModelType: 'serverSide',
  serverSideDatasource: { getRows },
  serverSideSortOnServer: true,
  serverSideFilterOnServer: true,
  pagination: true,
  defaultColDef: {
    resizable: true,
    sortable: true,
  },
  rowSelection: 'single',
  paginationPageSize: pageSize,
  cacheBlockSize: pageSize,
  sideBar: {
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivots: true,
          suppressPivotMode: true,
          suppressColumnSelectAll: true,
          suppressColumnExpandAll: true,
        },
      },
      'filters',
    ],
    hiddenByDefault: false,
  },
})
