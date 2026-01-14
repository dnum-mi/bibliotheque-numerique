<script lang="ts" setup>
import type { IFileOutput, IFilter, IPagination, FileDsSourceLabelKey } from '@biblio-num/shared'
import { fileDsSourceLabels, dFileSourceLabelDictionary, fileExtensions, states, eState, fileTags } from '@biblio-num/shared'
import type { ApiCall } from '../server-side/filters.utils'
import type { BNColDef } from '../server-side/bn-col-def.interface'
import MimeTypeCellRenderer from './MimeTypeCellRenderer.vue'
import AttachedFileStateCellRenderer from './AttachedFileStateCellRenderer.vue'
import FileTagBadgeRenderer from '@/components/Badges/file-tag/FileTagBadgeRenderer.vue'
import useToaster from '@/composables/use-toaster'
import type { Message as ToasterMessage } from '@/composables/use-toaster'
import { downloadFile } from '@/utils/downloadFile'
import DataTableServerSide from '../server-side/DataTableServerSide.vue'

type AttachedFileListProps = {
  tag?: string,
  fetchAttachedFiles: ApiCall<IFileOutput>
  columnsDef?: BNColDef[]
  active?: boolean
  withTabTag?: boolean
}

const props = withDefaults(defineProps<AttachedFileListProps>(), {
  tag: undefined,
  columnsDef: undefined,
})

const emit = defineEmits<{
  'filesFetched': [],
}>()

const defaultColumnsDef: BNColDef[] = [
  {
    headerName: 'État téléchargement',
    field: 'state',
    filter: 'agSetColumnFilter',
    filterParams: {
      values: states,
      suppressSelectAll: true,
      cellRenderer: markRaw(AttachedFileStateCellRenderer),
      cellRendererParams: {
        displayText: true,
      },
    },
    menuTabs: ['filterMenuTab'],
    cellRenderer: markRaw(AttachedFileStateCellRenderer),
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
    field: 'label',
    filter: 'agTextColumnFilter',
    menuTabs: ['filterMenuTab'],
    width: 400,
  },
  {
    headerName: 'Nom original',
    field: 'originalLabel',
    filter: 'agTextColumnFilter',
    menuTabs: ['filterMenuTab'],
  },
  {
    headerName: 'Type',
    field: 'mimeType',
    filter: 'agSetColumnFilter',
    filterParams: {
      values: fileExtensions,
      cellRenderer: markRaw(MimeTypeCellRenderer),
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
    cellRenderer: markRaw(MimeTypeCellRenderer),
    cellStyle: { display: 'flex', 'align-items': 'center' },
  },
]

const toaster = useToaster()
const paginationDto = ref()
const fetching = ref(false)

const activeColumnsDef = computed(() => {
  const baseCols = props.columnsDef ?? defaultColumnsDef

  if (!props.withTabTag) {
    return baseCols
  }

  return [
    ...baseCols.slice(0, 2),
    {
      headerName: 'Tag',
      field: 'tag',
      filter: 'agSetColumnFilter',
      menuTabs: ['filterMenuTab'],
      filterParams: { values: fileTags, cellRenderer: FileTagBadgeRenderer },
      cellRenderer: markRaw(FileTagBadgeRenderer),
      width: 250,
    },
    ...baseCols.slice(2),
  ]
})

const onSelectionChanged = async ({ data: file }: {
  data: {
    id: number,
    label: string,
    mimeType: string,
    sourceLabel: string,
    originalLabel?: string,
    state: string,
    tag: string,
    uuid: string
  }
}) => {
  if (file.state === eState.uploaded) {
    await downloadFile(file.uuid)
    return
  }

  const message: ToasterMessage = {
    description: `Le fichier ${file.label} n'est pas téléchargeable`,
    type: 'warning',
  }

  if (file.state === eState.failed) {
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
  const files = await props.fetchAttachedFiles(params).finally(() => {
    fetching.value = false
  })
  emit('filesFetched')
  return files
}
</script>

<template>
  <DataTableServerSide
    v-if="active"
    v-model:pagination-dto="paginationDto"
    :column-defs="activeColumnsDef"
    :loading="fetching"
    pre-condition
    :api-call="apiCall"
    @row-click="onSelectionChanged($event)"
  />
</template>
