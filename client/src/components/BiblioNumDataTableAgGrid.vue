<template>
  <h4>{{ title }}</h4>
  <ag-grid-vue
    style="max-width: 100%; height: 700px;"
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
  />
</template>
<script lang="ts" setup>
import { computed } from 'vue'
import type { TypeHeaderDataTable } from './typeDataTable'

import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import TableCellAction from './TableCellAction.vue'
import { PAGINATION_PAGE_SIZE } from '@/config'

import { filter2Apply } from './ag-grid/filtersRender'
import { localeTextAgGrid } from './ag-grid/agGridOptions'

const getFilterAgGrid = (type) => {
  return (type && filter2Apply[type]) || { }
}

const props = withDefaults(defineProps<{
    title: string,
    rowData?: object[],
    headers?: TypeHeaderDataTable[],
    pagination?: boolean,
    paginationPageSize?: number,
    withAction?: boolean,
    rowSelection?: string,

  }>(), {
  rowData: () => [],
  headers: () => [],
  pagination: false,
  paginationPageSize: PAGINATION_PAGE_SIZE,
  withAction: false,
  rowSelection: undefined,
})

const columnDefs = computed(() => {
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
  return columnDefs.concat(headers.map((header) => {
    const filter = getFilterAgGrid(header.type)
    return {
      headerName: header.text || '',
      field: header.value,
      width: header.width || undefined,
      cellRenderer: header.parseFn ? (params: any) => header.parseFn?.(params.value) : undefined,
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

</script>
