<script lang="ts" setup>
import type { GridReadyEvent, GridApi, GridOptions, AgGridEvent } from 'ag-grid-community'

import type { IFileOutput, IFilter, IPagination, StateKey, FileDsSourceLabelKey } from '@biblio-num/shared'
import { fileDsSourceLabels, dFileSourceLabelDictionary, fileExtensions, states, eState, fileTabTags } from '@biblio-num/shared'

import type { ApiCall } from '../server-side/pagination.utils'
import type { BNColDef } from '../server-side/bn-col-def.interface'
import MimeTypeCellRenderer from './MimeTypeCellRenderer.vue'
import AttachedFileStateCellRenderer from './AttachedFileStateCellRenderer.vue'
import { baseApiUrl } from '@/api/api-client'
import FileTagBadgeRenderer from '@/components/Badges/file-tag/FileTagBadgeRenderer.vue'
import useToaster, { type Message as ToasterMessage } from '@/composables/use-toaster'

type AttachedFileListProps = {
  tag?: string,
  fetchAttachedFiles: ApiCall<IFileOutput>
  columnsDef?: BNColDef[]
  active?: boolean
  withTabTag?: boolean
}

const emit = defineEmits<{
  'grid-ready': [event: GridReadyEvent],
  'files-fetched': [],
}>()

const props = withDefaults(defineProps<AttachedFileListProps>(), {
  tag: undefined,
  columnsDef: (): BNColDef[] => [
    {
      headerName: 'État téléchargement',
      field: 'state',
      filter: 'agSetColumnFilter',
      filterParams: {
        values: states,
        suppressSelectAll: true,
        cellRenderer: AttachedFileStateCellRenderer,
        cellRendererParams: {
          displayText: true,
        },
      },
      menuTabs: ['filterMenuTab'],
      cellRenderer: AttachedFileStateCellRenderer,
      width: 100,
    },
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
      filter: 'agSetColumnFilter',
      filterParams: {
        values: fileDsSourceLabels,
        cellRenderer: (params: { value: FileDsSourceLabelKey }) => dFileSourceLabelDictionary[params.value] ?? 'Tout',
      },
      valueFormatter: (params: { value: FileDsSourceLabelKey }) => dFileSourceLabelDictionary[params.value],
      menuTabs: ['filterMenuTab'],
      width: 200,
    },
    {
      headerName: 'Nom',
      field: 'originalLabel',
      filter: 'agTextColumnFilter',
      menuTabs: ['filterMenuTab'],
      width: 400,
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
      filter: 'agSetColumnFilter',
      filterParams: {
        values: fileExtensions,
        cellRenderer: MimeTypeCellRenderer,
        suppressSelectAll: true,
        cellRendererParams: {
          displayText: true,
          dict: {
            doc: 'Word',
            docx: 'Word 2007+',
            xls: 'Excel',
            xlsx: 'Excel 2007+',
            pdf: 'PDF',
            jpeg: 'Image JPEG',
            jpg: 'Image JPEG',
            png: 'Image PNG',
            unknown: 'Inconnu',
          },
        },
      },
      menuTabs: ['filterMenuTab'],
      cellRenderer: MimeTypeCellRenderer,
      cellStyle: { display: 'flex', 'align-items': 'center' },
    },
  ],
})

const toaster = useToaster()

const columnsDef = ref<BNColDef[]>(props.columnsDef)

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
  const file = event.api.getSelectedRows()?.[0]

  if (file?.state === eState.uploaded) {
    const url = `${baseApiUrl}/files/${file?.uuid}`
    if (url) {
      window.open(url, '_blank')
    }
    return
  }
  const message: ToasterMessage = { description: `Le fichier ${file?.originalLabel} n'est pas téléchargeable`, type: 'warning' }

  if (file?.state === eState.failed) {
    message.description = `${message.description}. La récupération du fichier a échoué.`
    message.type = 'error'
  } else {
    message.description = `${message.description}. La récupération du fichier est en cours.`
  }

  toaster.addMessage(message)
}

const apiCall: ApiCall<IFileOutput> = async (params: IPagination<IFileOutput>) => {
  fetching.value = true
  params.columns = [...params.columns, 'uuid', 'tag']
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

onMounted(() => {
  if (props.withTabTag) {
    columnsDef.value = [
      ...columnsDef.value.slice(0, 2),
      {
        headerName: 'Tag',
        field: 'tag',
        filter: 'agSetColumFilter',
        menuTabs: ['filterMenuTab'],
        filterParams: { values: fileTabTags, cellRenderer: FileTagBadgeRenderer },
        cellRenderer: FileTagBadgeRenderer,
        width: 250,
      },
      ...columnsDef.value.slice(2),
    ]
  }
})
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
