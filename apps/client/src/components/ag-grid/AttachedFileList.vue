<script lang="ts" setup>
import type { GridReadyEvent, GridApi, GridOptions, AgGridEvent } from 'ag-grid-community'

import type { IFileOutput, IFilter, IFilterEnum, IPagination } from '@biblio-num/shared'

import type { ApiCall } from './server-side/pagination.utils'
import type { BNColDef } from './server-side/bn-col-def.interface'
import MimeTypeCellRenderer from './MimeTypeCellRenderer.vue'
import AttachedFileStateCellRenderer from './AttachedFileStateCellRenderer.vue'

type AttachedFileListProps = {
  tag: string,
  fnAttachedFiles: ApiCall<IFileOutput>
  columnsDef?: BNColDef[]
}

const emit = defineEmits<{
  'grid-ready': [event: GridReadyEvent],
}>()

const props = withDefaults(defineProps<AttachedFileListProps>(), {
  columnsDef: (): BNColDef[] => [
    {
      headerName: 'Identifiant',
      field: 'fileId',
      hide: true,
      filter: 'agNumberColumnFilter',
      menuTabs: ['filterMenuTab'],
    },
    {
      headerName: 'Source',
      field: 'sourceLabel',
      filter: 'agTextColumnFilter',
      menuTabs: ['filterMenuTab'],
    },
    {
      headerName: 'État',
      field: 'state',
      filter: 'agTextColumnFilter',
      menuTabs: ['filterMenuTab'],
      cellRenderer: AttachedFileStateCellRenderer,
    },
    {
      headerName: 'Nom',
      field: 'label',
      filter: 'agTextColumnFilter',
      menuTabs: ['filterMenuTab'],
    },
    // {
    //   headerName: 'Nom original',
    //   field: 'originalLabel',
    //   filter: 'agTextColumnFilter',
    //   menuTabs: ['filterMenuTab'],
    // },
    {
      headerName: 'Type',
      field: 'mimeType',
      filter: 'agTextColumnFilter',
      menuTabs: ['filterMenuTab'],
      cellRenderer: MimeTypeCellRenderer,
      cellStyle: { display: 'flex', 'align-items': 'center' },
    },
  ],
})

const gridApi = ref<GridApi>()
const onGridReady = (event: GridReadyEvent) => {
  gridApi.value = event.api
  emit('grid-ready', event)
}
const paginationDto = ref()
const fetching = ref(false)

const specificGridOptions: Partial<GridOptions> = {
  suppressMovableColumns: true,
  sideBar: null,
}

const onSelectionChanged = (event: AgGridEvent) => {
  const url = event.api.getSelectedRows()?.[0]?.url
  if (url) {
    window.open(url, '_blank')
  }
}
const apiCall: ApiCall<IFileOutput> = async (params: IPagination<IFileOutput>) => {
  fetching.value = true

  const filterTag:IFilterEnum = {
    filterType: 'set',
    condition1: { filter: [props.tag] },
  }
  const res = await props.fnAttachedFiles({
    ...params,
    filters: {
      ...(params.filters),
      tag: filterTag,
    },
  })
  fetching.value = false
  return res
}
</script>

<template>
  <AgGridServerSide
    ref="agGridComponent"
    v-model:pagination-dto="paginationDto"
    :column-defs="columnsDef"
    :loading="fetching"
    :pre-condition="true"
    :specific-grid-option="specificGridOptions"
    :on-selection-changed="onSelectionChanged"
    :api-call="apiCall"
    @grid-ready="onGridReady($event)"
  />
</template>
