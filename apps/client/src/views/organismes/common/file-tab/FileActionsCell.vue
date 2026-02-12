<script setup lang="ts">
import { downloadHubFile } from '@/utils/downloadFile'
import type { IFile, organismeCategoryKey } from '@biblio-num/shared'

const props = defineProps<{
  params: {
    data: IFile
    context?: {
      organismeType: organismeCategoryKey
      organismeId: string
      onViewFile?: (file: IFile) => void
    }
  }
}>()

const isDownloading = ref(false)

const onDownload = async () => {
  if (isDownloading.value) {
    return
  }

  try {
    isDownloading.value = true
    await downloadHubFile({
      organismeType: props.params.context?.organismeType || 'association',
      organismeId: props.params.context?.organismeId || '',
      file: props.params.data,
    })
  } catch (error) {
    console.error('Erreur lors du téléchargement :', error)
  } finally {
    isDownloading.value = false
  }
}

const onView = () => {
  if (props.params.context?.onViewFile) {
    props.params.context.onViewFile(props.params.data)
  }
}
</script>

<template>
  <div class="flex gap-2">
    <DsfrButton
      icon="fr-icon-eye-line"
      secondary
      size="sm"
      icon-only
      title="Voir le fichier"
      @click="onView"
    />
    <DsfrButton
      :icon="isDownloading ? { name: 'ri-refresh-line', animation: 'spin' } : 'fr-icon-download-line'"
      secondary
      size="sm"
      icon-only
      :title="isDownloading ? 'Téléchargement...' : 'Télécharger'"
      :disabled="isDownloading"
      @click="onDownload"
    />
  </div>
</template>

<style scoped>
.fr-icon-refresh-line {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
