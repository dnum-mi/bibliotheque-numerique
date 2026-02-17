<script setup lang="ts">
import { typeFileArray } from '@biblio-num/shared'
import type { IFile, organismeCategoryKey } from '@biblio-num/shared'
import { dateToStringFr } from '@/utils/date-to-string'
import { fetchHubFileBlobForPreview, downloadHubMultipleFiles } from '@/utils/downloadFile'
import type { HeaderDataTable } from '@/shared/types'
import type { RowDataType } from '@/components/datatable/client-side/DataTableClientSide.vue'
import { DsfrButton } from '@gouvminint/vue-dsfr'
import FileActionsCell from './FileActionsCell.vue'
import { pluralize } from '@/utils/pluralize'
import FileViewerModal from '@/components/FilePreviewModal.vue'
import TableTagInfo from '@/components/TableTagInfo.vue'

type IFileWithAuthorizeOption = IFile & RowDataType

const props = defineProps<{
  organismeType: organismeCategoryKey
  organismeId: string
  files: IFile[]
}>()

const isPreviewOpen = ref(false)
const previewLoading = ref(false)
const fileData = ref<{ name: string; url: string; extension: string } | null>(null)
const isDownloading = ref(false)

const headers: HeaderDataTable[] = [
  { field: 'id', text: 'ID', type: 'hidden' },
  {
    field: 'typeFile',
    text: 'Type',
    renderer: TableTagInfo,
    filterable: true,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: [...typeFileArray],
      cellRenderer: markRaw(TableTagInfo),
    },
  },
  { field: 'name', text: 'Nom de la pièce', sortable: true },
  {
    field: 'uploadedAt',
    text: 'Date',
    sortable: true,
    valueFormatter: (params) => dateToStringFr(params.value),
    filterable: true,
    filter: 'agMultiColumnFilter',
  },
  {
    field: '_actions',
    text: 'Actions',
    sortable: false,
    filterable: false,
    width: 120,
    renderer: markRaw(FileActionsCell),
  },
]

const rowsData = computed<IFileWithAuthorizeOption[]>(() => {
  return props.files.map(file => ({
    ...file,
    authorized: true,
    cursor: file.id,
    _actions: file,

  }))
})

const title = computed(() => pluralize({
  count: props.files.length,
  singular: 'pièce jointe',
  plural: 'pièces jointes',
}))

const selectedFiles = ref<IFile[]>([])

const selectedFilesDisplay = computed(() => pluralize({
  count: selectedFiles.value.length,
  singular: 'ligne sélectionnée',
  plural: 'lignes sélectionnées',
}))

const handleSelection = (items: any[]) => {
  selectedFiles.value = items
}

const handleDownloadSelected = async () => {
  if (isDownloading.value) {
    return
  }
  try {
    isDownloading.value = true
    const fileIds = selectedFiles.value.map(({ id }) => id)
    await downloadHubMultipleFiles({
      organismeType: props.organismeType || 'association',
      organismeId: props.organismeId || '',
      fileIds,
    })
  } catch (error) {
    console.error('Erreur lors du téléchargement :', error)
  } finally {
    isDownloading.value = false
  }
}

const handleViewFile = async (file: IFile) => {
  try {
    isPreviewOpen.value = true
    previewLoading.value = true
    fileData.value = null

    const result = await fetchHubFileBlobForPreview({
      organismeType: props.organismeType,
      organismeId: props.organismeId,
      file,
    })

    const url = URL.createObjectURL(result.blob)

    fileData.value = {
      name: result.filename,
      url,
      extension: result.filename.split('.').pop() || '',
    }

    isPreviewOpen.value = true
  } catch {
    isPreviewOpen.value = false
  } finally {
    previewLoading.value = false
  }
}

const closeViewer = () => {
  if (fileData.value?.url) {
    URL.revokeObjectURL(fileData.value.url)
  }
  isPreviewOpen.value = false
  previewLoading.value = false
  fileData.value = null
}
</script>

<template>
  <div class="fr-container fr-py-4w">
    <h2 class="fr-h4 fr-mb-2w">
      {{ title }}
    </h2>

    <div class="flex items-center justify-between fr-mt-4w fr-mb-2w">
      <p v-if="!selectedFiles.length" class="fr-text--sm fr-mb-0">
        Sélectionner des lignes pour pouvoir télécharger plusieurs pièces jointes
      </p>
      <p v-else class="fr-text--sm fr-mb-0">
        {{ selectedFilesDisplay }}
      </p>
      <DsfrButton
        :icon="isDownloading ? { name: 'ri-refresh-line', animation: 'spin' } : 'fr-icon-download-line'"
        :label="isDownloading ? 'Téléchargement...' : 'Télécharger les pièces'"
        tertiary
        size="sm"
        :disabled="!selectedFiles.length || isDownloading"
        @click="handleDownloadSelected"
      />
    </div>

    <DataTableClientSide
      :headers="headers"
      :rows-data="rowsData"
      selectable
      data-key="id"
      :context="{
        organismeId: props.organismeId,
        organismeType: props.organismeType,
        onViewFile: handleViewFile,
      }"
      :pagination-page-size="20"
      @selection-change="handleSelection"
    />

    <FileViewerModal
      :is-open="isPreviewOpen"
      :file="fileData"
      :loading="previewLoading"
      @close="closeViewer"
    />
  </div>
</template>
