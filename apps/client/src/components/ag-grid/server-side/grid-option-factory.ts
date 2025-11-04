import type { GridOptions, IServerSideGetRowsParams } from 'ag-grid-community'
import CustomDateFilter from '@/components/ag-grid/custom-filters/CustomDateFilter.vue'
import CustomNumbersFilter from '@/components/ag-grid/custom-filters/CustomNumbersFilter.vue'
import { AG_GRID_LOCALE_FR } from '@ag-grid-community/locale'
import { localeTextAgGrid } from '@/components/ag-grid/ag-grid-fr-dictionnary.ts'
import CustomStringsFilter from '../custom-filters/CustomStringsFilter.vue'

export const gridOptionFactory = (getRows: (params: IServerSideGetRowsParams) => void, pageSize: number): GridOptions => ({
  localeText: { ...AG_GRID_LOCALE_FR, ...localeTextAgGrid },
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
  components: {
    customDateFilter: CustomDateFilter,
    customNumbersFilter: CustomNumbersFilter,
    customStringsFilter: CustomStringsFilter,
  },
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
    ],
    hiddenByDefault: false,
  },
})
