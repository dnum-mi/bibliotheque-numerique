<script lang="ts" setup>
import { computed, watchEffect, ref, type ComputedRef, type Component, toRaw } from 'vue'

import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

import { AgGridFilter, type Action, type HeaderDataTable } from '@/shared/types'
import TableCellAction from './TableCellAction.vue'
import { PAGINATION_PAGE_SIZE } from '@/config'

import { filterToApply } from './ag-grid/filtersRender'
import { localeTextAgGrid } from './ag-grid/agGridOptions'

import AgGridMultiValueCell from './ag-grid/AgGridMultiValueCell.vue'
import AgGridAttachmentCell from './ag-grid/AgGridAttachmentCell.vue'

const getFilterAgGrid = ({ type, filter }: {type: string; filter: string }) => {
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
const getRendererAgGrid = (header) => {
  const { renderer, type } = header

  const typeRenderder = renderer === AgGridFilter.MULTI_VALUE ? AgGridFilter.MULTI_VALUE : type
  const agRenderer = toRenderer[typeRenderder]
  return agRenderer
}

const props = withDefaults(defineProps<{
    title?: string,
    rowData?: Record<string, any>[],
    headers?: HeaderDataTable[],
    pagination?: boolean,
    paginationPageSize?: number,
    withAction?: boolean,
    rowSelection?: string,
    floatingFilter?: boolean,
  }>(), {
  title: undefined,
  rowData: () => [],
  headers: () => [],
  pagination: false,
  paginationPageSize: PAGINATION_PAGE_SIZE,
  withAction: false,
  rowSelection: undefined,
  floatingFilter: false,
})

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
    return
  }
  const headers: HeaderDataTable[] = [...props.headers]

  const filteredHeaders = headers
    .filter((header, idx) => ((props.withAction && idx === 0) || header.type !== 'hidden'))
    .map((header) => {
      const filter = getFilterAgGrid(header)
      const renderer = getRendererAgGrid(header) || {
        cellRenderer: header.renderer ?? (header.parseFn ? (params: any) => header.parseFn?.(params.value) : undefined),
      }
      return {
        floatingFilter: props.floatingFilter,
        headerName: header.text || '',
        field: header.value,
        width: header.width || undefined,
        ...renderer,
        ...filter,
      }
    })

  return [
    ...(props.withAction
      ? [{
          headerName: 'Action',
          field: headers[0].value,
          action: headers[0]?.action || undefined,
          cellRenderer: TableCellAction,
          initialPinned: 'left',
          width: 100,
          sortable: false,
          filter: false,
          suppressMenu: false,
        }]
      : []),
    ...filteredHeaders,
  ]
/*
  columnDefs.concat()
  */
})

const emit = defineEmits(['getElt', 'selectionChanged'])
const showElt = ($event) => {
  emit('getElt', $event)
}

const context = { showElt }
const sideBar = {
  toolPanels: ['columns', 'filters'],
  SideBarDef: {
    hiddenByDefault: false,
  },
}

const gridOptions = {
  localeText: localeTextAgGrid,
}

const onSelectionChanged = (params) => {
  emit('selectionChanged', params.api.getSelectedRows())
}

const gridApi = ref() // Optional - for accessing Grid's API
const columnApi = ref() // Optional - for accessing Grid's API

const onGridReady = (params) => {
  watchEffect(() => { params.api.setRowData(props.rowData) })
  gridApi.value = params.api
  columnApi.value = params.columnApi
}

defineExpose({
  getCurrentFilter () {
    const filters = Object.fromEntries(Object.entries(gridApi.value?.getFilterModel()).map(([key, value]) => ([key, value])))
    // const columnStates = columnApi.value.getColumnState().map(({ colId, filter }) => ({ colId, filter }))
    return filters
  },
  setFilters (filters) {
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
    style="max-width: 100%;height: 690px;"
    class="ag-theme-alpine"
    :column-defs="columnDefs"
    :row-data="rowData"
    :pagination="pagination"
    :pagination-page-size="paginationPageSize"
    :default-col-def="{
      sortable: true,
      resizable: true,
      filter: true
    }"
    :context="context"
    :side-bar="sideBar"
    :grid-options="gridOptions"
    :row-selection="rowSelection"
    @selection-changed="onSelectionChanged($event)"
    @grid-ready="onGridReady"
  />
</template>
