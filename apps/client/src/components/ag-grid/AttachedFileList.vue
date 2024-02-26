<script lang="ts" setup>
import type { GridReadyEvent, GridApi, GridOptions, AgGridEvent } from 'ag-grid-community'

import type { IFileOutput, IFilter, IPagination } from '@biblio-num/shared'

import type { ApiCall } from './server-side/pagination.utils'
import type { BNColDef } from './server-side/bn-col-def.interface'
import MimeTypeCellRenderer from './MimeTypeCellRenderer.vue'
import AttachedFileStateCellRenderer from './AttachedFileStateCellRenderer.vue'

type AttachedFileListProps = {
  tag: string,
  fetchAttachedFiles: ApiCall<IFileOutput>
  columnsDef?: BNColDef[]
  active?: boolean
}

const emit = defineEmits<{
  'grid-ready': [event: GridReadyEvent],
  'files-fetched': [],
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
  if (props.tag) {
    params.filters = {
      ...(params.filters ?? {}),
      tag: {
        filterType: 'set',
        condition1: { filter: [props.tag] },
      },
    } as Record<keyof IFileOutput, IFilter>
  }
  const files = await props.fetchAttachedFiles(params).finally(() => { fetching.value = false })
  emit('files-fetched')
  return files
}
</script>

<template>
  <AgGridServerSide
    v-if="active"
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
