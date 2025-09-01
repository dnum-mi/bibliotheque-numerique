<script lang="ts" setup>
import { AgGridVue } from 'ag-grid-vue3'
import type { SelectionChangedEvent, GridReadyEvent, FilterChangedEvent } from 'ag-grid-community'
import type { RowStyle } from 'ag-grid-enterprise'
import type { AgGridCommon } from 'ag-grid-community/dist/lib/interfaces/iCommon'

import { agGridFilterDict } from '@/shared/types'
import type { AgGridFilterKey, Action, HeaderDataTable } from '@/shared/types'
import TableCellAction from './TableCellAction.vue'
import { PAGINATION_PAGE_SIZE } from '@/config'

import { filterToApply } from './ag-grid/filtersRender'
import { localeTextAgGrid } from './ag-grid/ag-grid-fr-dictionnary.ts'

import AgGridMultiValueCell from './ag-grid/AgGridMultiValueCell.vue'
import AgGridAttachmentCell from './ag-grid/AgGridAttachmentCell.vue'
import type { DisplayActiveFilter } from './ag-grid/active-filters/activeFilters.type.ts'

const props = withDefaults(
  defineProps<{
    title?: string
    rowData?: Record<string, string | number>[]
    actionTitle: string
    headers?: HeaderDataTable[]
    pagination?: boolean
    paginationPageSize?: number
    withAction?: boolean
    rowSelection?: string
    floatingFilter?: boolean
    isHiddenSideBar?: boolean
    rowStyle?: RowStyle
  }>(),
  {
    title: undefined,
    rowData: () => [],
    headers: () => [],
    paginationPageSize: PAGINATION_PAGE_SIZE,
    rowSelection: undefined,
    rowStyle: () => ({}),
  },
)
const emit = defineEmits(['getElt', 'selectionChanged', 'filtersUpdated'])

const showElt = ($event: string) => {
  emit('getElt', $event)
}

const context = { showElt }

const getFilterAgGrid = ({ type, filter }: HeaderDataTable) => {
  const typeFilter = filter === agGridFilterDict.MULTI_VALUE && type === 'number' ? agGridFilterDict.MULTI_VALUE_NUMBER : type
  return (typeFilter && filterToApply[typeFilter as AgGridFilterKey]) || {}
}

const toRenderer = {
  [agGridFilterDict.MULTI_VALUE]: {
    cellRenderer: AgGridMultiValueCell,
    autoHeight: true,
  },
  [agGridFilterDict.FILE]: {
    cellRenderer: AgGridAttachmentCell,
  },
}
const getRendererAgGrid = (header: HeaderDataTable) => {
  const { renderer, type } = header

  const typeRenderer = renderer === agGridFilterDict.MULTI_VALUE ? agGridFilterDict.MULTI_VALUE : type
  // @ts-expect-error this uses dynamic key
  const agRenderer = toRenderer[typeRenderer]
  return agRenderer
}

interface AgGridColumnDefs {
  headerName?: string
  field?: string
  action?: Action | undefined
  cellRenderer: Component
  initialPinned?: 'left' | 'right'
  width?: number
  sortable?: boolean
  filter?: boolean
  suppressMenu?: boolean
}

const columnDefs: ComputedRef<AgGridColumnDefs[]> = computed(() => {
  if (!props.headers.length) {
    return []
  }
  const headers: HeaderDataTable[] = [...props.headers]

  const filteredHeaders = headers
    .filter((header, idx) => (props.withAction && idx === 0) || header.type !== 'hidden')
    .map((header) => {
      const filter = getFilterAgGrid(header)
      const renderer = getRendererAgGrid(header) || {
        cellRenderer:
          header.renderer ?? (header.parseFn ? (params: Record<string | symbol, unknown>) => header.parseFn?.(params.value) : undefined),
      }
      return {
        floatingFilter: props.floatingFilter,
        headerName: header.text || '',
        field: header.value,
        width: header.width || undefined,
        ...renderer,
        ...filter,
        hide: header.hide,
        valueFormatter: header?.valueFormatter,
        filterParams: header?.filterParams,
      }
    })

  return [
    ...(props.withAction
      ? [
          {
            headerName: 'Action',
            field: headers[0].value,
            cellRenderer: TableCellAction,
            cellRendererParams: {
              action: headers[0].action,
              title: props.actionTitle,
            },
            initialPinned: 'left',
            width: 100,
            sortable: false,
            filter: false,
            suppressMenu: false,
          },
        ]
      : []),
    ...filteredHeaders,
  ]
})

const sideBar = computed(() =>
  props.isHiddenSideBar
    ? false
    : {
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
        SideBarDef: {
          hiddenByDefault: false,
        },
      },
)

const gridOptions = {
  localeText: localeTextAgGrid,
}

const onSelectionChanged = (params: SelectionChangedEvent) => {
  emit('selectionChanged', params.api.getSelectedRows())
}

const gridApi = ref<AgGridCommon<unknown, unknown>['api']>() // Optional - for accessing Grid's API
const columnApi = ref<AgGridCommon<unknown, unknown>['columnApi']>() // Optional - for accessing Grid's API

const onGridReady = (params: GridReadyEvent) => {
  watchEffect(() => {
    params.api.setRowData(props.rowData)
  })
  gridApi.value = params.api
  columnApi.value = params.columnApi
}

const handleFilterChanged = (event: FilterChangedEvent) => {
  if (!event.api) {
    return
  }
  const currentFilterModel = event.api.getFilterModel()

  const activeFilters: DisplayActiveFilter[] = []

  for (const colId in currentFilterModel) {
    if (Object.prototype.hasOwnProperty.call(currentFilterModel, colId)) {
      const model = currentFilterModel[colId] as any

      let finalFilterType = model.filterType
      if (!finalFilterType) {
        if (model.dateFrom !== undefined) {
          finalFilterType = 'date'
        }
        if (Array.isArray(model.values)) {
          finalFilterType = 'set'
        }
        if (Array.isArray(model.filter) && model.filter.every((item: any) => typeof item === 'number')) {
          finalFilterType = 'numbers'
        }
        if (model.operator && (model.condition1 || model.conditions)) {
          const firstCond = model.condition1 || (Array.isArray(model.conditions) ? model.conditions[0] : null)
          if (firstCond && firstCond.filterType) {
            finalFilterType = firstCond.filterType
          } else {
            finalFilterType = 'text'
          }
        }
        if (model.type) {
          finalFilterType = 'text'
        }
      }

      const filterEntry: DisplayActiveFilter = {
        colId,
        filterType: finalFilterType,
        type: model.type,
        filter: model.filter,
        filterTo: model.filterTo,
        dateFrom: model.dateFrom,
        dateTo: model.dateTo,
        values: model.values,
        operator: model.operator,
        conditions: model.condition1 && model.condition2 ? [model.condition1, model.condition2] : model.conditions,
        filterModels: model.filterModels,
        value: model.value,
        includeEmpty: model.includeEmpty,
      }
      activeFilters.push(filterEntry)
    }
  }
  emit('filtersUpdated', activeFilters)
}

defineExpose({
  getCurrentFilter () {
    const filterModel = gridApi.value?.getFilterModel() || {}
    const filters = Object.fromEntries(Object.entries(filterModel).map(([key, value]) => [key, value]))
    // const columnStates = columnApi.value?.getColumnState().map(({ colId }) => ({ colId }))
    return filters
  },
  setFilters (filters: Parameters<AgGridCommon<unknown, unknown>['api']['setFilterModel']>[0]) {
    gridApi.value?.setFilterModel(filters)
  },
  clearAllFilters () {
    gridApi.value?.setFilterModel(null)
  },
  removeFilter (colId: string) {
    const filterInstance = gridApi.value?.getFilterInstance(colId)
    if (filterInstance) {
      filterInstance.setModel(null)
      gridApi.value?.onFilterChanged()
    }
  },
  getGridApi: () => gridApi.value,
  getColumnApi: () => columnApi.value,
})
</script>

<template>
  <h4 v-if="title">
    {{ title }}
  </h4>
  <AgGridVue
    class="ag-theme-material m-w-full h-full"
    ensure-dom-order="true"
    :column-defs="columnDefs"
    :row-data="rowData"
    :pagination="pagination"
    :pagination-page-size="paginationPageSize"
    :default-col-def="{
      sortable: true,
      resizable: true,
      filter: true,
      enablePivot: false,
    }"
    :context="context"
    :side-bar="sideBar"
    :grid-options="gridOptions"
    :row-selection="rowSelection"
    :row-style="{ cursor: 'pointer' }"
    @selection-changed="onSelectionChanged($event)"
    @grid-ready="onGridReady"
    @filter-changed="handleFilterChanged($event)"
  />
</template>
