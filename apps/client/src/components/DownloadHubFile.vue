<script setup lang="ts">
import { prettyByteSizeByString } from '@/utils'
import { downloadHubFile } from '@/utils/downloadFile'
import type { IFile, organismeCategoryKey } from '@biblio-num/shared'

const props = defineProps<{
  file: IFile
  organismeType: organismeCategoryKey
  organismeId: string
  hideSize?: boolean
}>()

const isDownloading = ref(false)

const onDownload = async () => {
  if (isDownloading.value) {
    return
  }

  try {
    isDownloading.value = true
    await downloadHubFile({
      organismeType: props.organismeType,
      organismeId: props.organismeId,
      file: props.file,
    })
  } catch (e) {
    console.error('Erreur téléchargement', e)
  } finally {
    isDownloading.value = false
  }
}
</script>

<template>
  <button
    class="fr-link fr-link--sm fr-icon-file-text-line fr-link--icon-left fr-text--nowrap bn-file-link"
    :class="[isDownloading ? 'fr-icon-refresh-line rotating' : 'fr-icon-file-text-line']"
    type="button"
    :disabled="isDownloading"
    @click.stop="onDownload()"
  >
    {{ file.name }}
    <span v-if="!hideSize && file.byteSize" class="fr-text--xs text-grey fr-ml-1v">
      ({{ prettyByteSizeByString(String(file.byteSize)) }})
    </span>
  </button>
</template>

<style scoped>
.text-grey {
  color: var(--text-mention-grey);
  font-weight: normal;
}

button.fr-link {
  background-image: none;
  text-decoration: none;
  text-decoration: underline;
}

.bn-file-link {
  background-image: none;
  text-decoration: underline;
  transition: opacity 0.2s;
}

.opacity-50 {
  opacity: 0.5;
}

/* Animation de rotation pour l'icône de chargement */
.rotating::before {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.text-grey {
  color: var(--text-mention-grey);
}

button:disabled {
  cursor: wait;
}
</style>
