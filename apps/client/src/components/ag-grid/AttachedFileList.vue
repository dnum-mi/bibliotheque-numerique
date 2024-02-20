<script lang="ts" setup>
import type { GridReadyEvent, GridApi, ColDef, GridOptions, AgGridEvent } from 'ag-grid-community'

import type { IPagination, DynamicKeys } from '@biblio-num/shared'
import apiClient from '@/api/api-client'
import MimeTypeCellRenderer from './MimeTypeCellRenderer.vue'
import AttachedFileStateCellRenderer from './AttachedFileStateCellRenderer.vue'

type AttachedFileListProps = {
  preselectedTags: string[],
  columnsDef?: ColDef[]
}

const props = withDefaults(defineProps<AttachedFileListProps>(), {
  columnsDef: () => [
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
      width: '120px',
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
      width: '120px',
      cellRenderer: MimeTypeCellRenderer,
      cellStyle: { display: 'flex', 'align-items': 'center' },
    },
  ],
})

const gridApi = ref<GridApi>()
const onGridReady = (event: GridReadyEvent) => {
  gridApi.value = event.api
}
const paginationDto = ref()
const fetching = ref(false)
const specificGridOptions = ref<Partial<GridOptions>>({
  suppressMovableColumns: true,
  sideBar: null,
})
const onSelectionChanged = (event: AgGridEvent) => {
  const url = event.api.getSelectedRows()?.[0]?.url
  if (url) {
    window.open(url, '_blank')
  }
}
const apiCall = async (params: IPagination<DynamicKeys>) => {
  fetching.value = true
  const res = await apiClient.getAttachedFiles({ tags: props.preselectedTags, ...params })
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
