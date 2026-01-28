<script setup lang="ts">
import { prettyByteSizeByString } from '@/utils'
import type {
  IFile,
  organismeCategoryKey,
} from '@biblio-num/shared'
import { downloadHubFile } from '@/utils/downloadFile'

const props = defineProps<{
  file: IFile,
  organismeType: organismeCategoryKey,
  organismeId: string,
}>()

const handleDownload = async () => {
  await downloadHubFile({
    organismeType: props.organismeType,
    organismeId: props.organismeId,
    file: props.file,
  })
}
</script>

<template>
  <button
    class="fr-link"
    @click.prevent.stop="handleDownload"
  >
    {{ file?.name }}
    <em class="text-[var(--grey-625-425)]">({{ prettyByteSizeByString(String(file?.byteSize)) }})</em>
  </button>
</template>
