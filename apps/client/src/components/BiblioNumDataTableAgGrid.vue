<script lang="ts" setup>

import { computed, watchEffect, ref, type ComputedRef, type Component } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'

import { AgGridFilter, type Action, type HeaderDataTable } from '@/shared/types'
import TableCellAction from './TableCellAction.vue'
import { PAGINATION_PAGE_SIZE } from '@/config'

import { filterToApply } from './ag-grid/filtersRender'
import { localeTextAgGrid } from './ag-grid/agGridOptions'

import AgGridMultiValueCell from './ag-grid/AgGridMultiValueCell.vue'
import AgGridAttachmentCell from './ag-grid/AgGridAttachmentCell.vue'
import type { SelectionChangedEvent, GridReadyEvent } from 'ag-grid-community'
import type { RowStyle } from 'ag-grid-enterprise'
import type { AgGridCommon } from 'ag-grid-community/dist/lib/interfaces/iCommon'
import { onBeforeUnmount } from 'vue'

const props = withDefaults(defineProps<{
    title?: string,
    rowData?: Record<string, string | number>[],
    actionTitle: string,
    headers?: HeaderDataTable[],
    pagination?: boolean,
    paginationPageSize?: number,
    withAction?: boolean,
    rowSelection?: string,
    floatingFilter?: boolean,
    isHiddenSideBar?: boolean
    rowStyle?: RowStyle
  }>(), {
  title: undefined,
  rowData: () => [],
  headers: () => [],
  paginationPageSize: PAGINATION_PAGE_SIZE,
  rowSelection: undefined,
  rowStyle: () => ({}),
})

const getFilterAgGrid = ({ type, filter }: HeaderDataTable) => {
  const typeFilter = filter === AgGridFilter.MULTI_VALUE && type === 'number' ? AgGridFilter.MULTI_VALUE_NUMBER : type
  return (typeFilter && filterToApply[typeFilter as AgGridFilter]) || { }
}

const toRenderer = {
  [AgGridFilter.MULTI_VALUE]: {
    cellRenderer: AgGridMultiValueCell,
    autoHeight: true,
  },
  [AgGridFilter.FILE]: {
    cellRenderer: AgGridAttachmentCell,
  },
}
const getRendererAgGrid = (header: HeaderDataTable) => {
  const { renderer, type } = header

  const typeRenderer = renderer === AgGridFilter.MULTI_VALUE ? AgGridFilter.MULTI_VALUE : type
  // @ts-ignore this uses dynamic key
  const agRenderer = toRenderer[typeRenderer]
  return agRenderer
}

interface AgGridColumnDefs {
  headerName?: string,
  field?: string,
  action?: Action | undefined,
  cellRenderer: Component,
  initialPinned?: 'left' | 'right',
  width?: number,
  sortable?: boolean,
  filter?: boolean,
  suppressMenu?: boolean,
}

const columnDefs: ComputedRef<AgGridColumnDefs[]> = computed(() => {
  if (!props.headers.length) {
    return []
  }
  const headers: HeaderDataTable[] = [...props.headers]

  const filteredHeaders = headers
    .filter((header, idx) => ((props.withAction && idx === 0) || header.type !== 'hidden'))
    .map((header) => {
      const filter = getFilterAgGrid(header)
      const renderer = getRendererAgGrid(header) || {
        cellRenderer: header.renderer ??
        (header.parseFn
          ? (params: Record<string | symbol, unknown>) => header.parseFn?.(params.value)
          : undefined),
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
      ? [{
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
        }]
      : []),
    ...filteredHeaders,
  ]
})

const emit = defineEmits(['getElt', 'selectionChanged'])
const showElt = ($event: string) => {
  emit('getElt', $event)
}

const context = { showElt }
const sideBar = computed(() => props.isHiddenSideBar
  ? false
  : {
      toolPanels: [{
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
      }, 'filters'],
      SideBarDef: {
        hiddenByDefault: false,
      },
    })

const gridOptions = {
  localeText: localeTextAgGrid,
}

const onSelectionChanged = (params: SelectionChangedEvent) => {
  emit('selectionChanged', params.api.getSelectedRows())
}

const gridApi = ref<AgGridCommon<unknown, unknown>['api']>() // Optional - for accessing Grid's API
const columnApi = ref<AgGridCommon<unknown, unknown>['columnApi']>() // Optional - for accessing Grid's API

const onGridReady = (params: GridReadyEvent) => {
  const unwatch = watchEffect(() => { params.api.setRowData(props.rowData) })
  gridApi.value = params.api
  columnApi.value = params.columnApi
  onBeforeUnmount(unwatch)
}

defineExpose({
  getCurrentFilter () {
    const filterModel = gridApi.value?.getFilterModel() || {}
    const filters = Object.fromEntries(Object.entries(filterModel).map(([key, value]) => ([key, value])))
    // const columnStates = columnApi.value?.getColumnState().map(({ colId }) => ({ colId }))
    return filters
  },
  setFilters (filters: Parameters<AgGridCommon<unknown, unknown>['api']['setFilterModel']>[0]) {
    gridApi.value?.setFilterModel(filters)
  },
  resetAgGridFilters () {
    gridApi.value?.setFilterModel({})
  },
})
</script>

<template>
  <h4 v-if="title">
    {{ title }}
  </h4>
  <ag-grid-vue
    style="max-width: 100%; height: 690px"
    class="ag-theme-material"
    ensure-dom-order="true"
    :column-defs="columnDefs"
    :row-data="rowData"
    :pagination="pagination"
    :pagination-page-size="paginationPageSize"
    :default-col-def="{
      sortable: true,
      resizable: true,
      filter: true,
      enablePivot: false
    }"
    :context="context"
    :side-bar="sideBar"
    :grid-options="gridOptions"
    :row-selection="rowSelection"
    :row-style="{ cursor: 'pointer' }"
    @selection-changed="onSelectionChanged($event)"
    @grid-ready="onGridReady"
  />
</template>
