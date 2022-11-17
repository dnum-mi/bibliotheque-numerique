<template>
  <h4>{{ title }}</h4>
  <ag-grid-vue
    style="max-width: 100%; height: 450px;"
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

const props = withDefaults(defineProps<{
    title: string,
    rowData?: object[],
    headers?: TypeHeaderDataTable[],
    pagination?: boolean,
    paginationPageSize?: number,
    withAction?: boolean,
  }>(), {
  rowData: () => [],
  headers: () => [],
  pagination: true,
  paginationPageSize: PAGINATION_PAGE_SIZE,
  withAction: false,
})

const columnDefs = computed(() => [{
  headerName: 'Action',
  field: props.headers[0].value,
  cellRenderer: TableCellAction,
  initialPinned: 'left',
  width: 100,
},
...props.headers.slice(1)
  .map(header => ({
    headerName: header.text || '',
    field: header.value,
    cellRenderer: header.parseFn ? (params) => header.parseFn(params.value) : undefined,
  }))])

const emit = defineEmits(['getElt'])
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
</script>

<style scoped>

</style>
