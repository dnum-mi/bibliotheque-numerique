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
    @selection-changed="onSelectionChanged"
    @grid-ready="onGridReady"
  />
</template>

<script lang="ts" setup>
import { computed, ref, watchEffect } from 'vue'

import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'

import { ETypeFilter, type TypeHeaderDataTable } from '@/shared/types/typeDataTable'
import TableCellAction from './TableCellAction.vue'
import { PAGINATION_PAGE_SIZE } from '@/config'

import { filterToApply } from './ag-grid/filtersRender'
import { localeTextAgGrid } from './ag-grid/agGridOptions'

import AgGridMultiValueCell from './ag-grid/AgGridMultiValueCell.vue'
import AgGridAttachmentCell from './ag-grid/AgGridAttachmentCell.vue'

const getFilterAgGrid = (header) => {
  const { type, filter } = header
  const typeFilter = filter === ETypeFilter.MULTI_VALUE && type === 'number' ? ETypeFilter.MULTI_VALUE_NUMBER : type
  return (typeFilter && filterToApply[typeFilter as ETypeFilter]) || { }
}

const toRenderer = {
  [ETypeFilter.MULTI_VALUE]: {
    cellRenderer: AgGridMultiValueCell,
    autoHeight: true,
  },
  [ETypeFilter.FILE]: {
    cellRenderer: AgGridAttachmentCell,
  },
}
const getRendererAgGrid = (header) => {
  const { renderer, type } = header

  const typeRenderder = renderer === ETypeFilter.MULTI_VALUE ? ETypeFilter.MULTI_VALUE : type
  const agRenderer = toRenderer[typeRenderder]
  return agRenderer
}

const props = withDefaults(defineProps<{
    title?: string,
    rowData?: object[],
    headers?: TypeHeaderDataTable[],
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

const columnDefs = computed(() => {
  if (!props.headers.length) { return }
  const headers: TypeHeaderDataTable[] = [...props.headers]
  const columnDefs: any[] = []
  if (props.withAction) {
    columnDefs.unshift({
      headerName: 'Action',
      field: headers[0].value,
      action: headers[0]?.action || undefined,
      cellRenderer: TableCellAction,
      initialPinned: 'left',
      width: 100,
      sortable: false,
      filter: false,
      suppressMenu: false,
    })
    headers.shift()
  }

  return columnDefs.concat(headers.filter(header => header.type !== 'hidden').map((header) => {
    const filter = getFilterAgGrid(header)
    const renderer = getRendererAgGrid(header) || {
      cellRenderer: header.parseFn ? (params: any) => header.parseFn?.(params.value) : undefined,
    }
    return {
      floatingFilter: props.floatingFilter,
      headerName: header.text || '',
      field: header.value,
      width: header.width || undefined,
      ...renderer,
      ...filter,
    }
  }))
})

const emit = defineEmits(['getElt', 'selectionChanged'])
const showElt = data => {
  emit('getElt', data)
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

const onGridReady = (params) => {
  watchEffect(() => { params.api.setRowData(props.rowData) })
}
</script>
