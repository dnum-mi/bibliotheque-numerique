<script setup lang="ts">
import { prettyByteSizeByString } from '@/utils'
import { eState } from '@biblio-num/shared'
import type { StateKey } from '@biblio-num/shared'
import { downloadFile } from '@/utils/downloadFile'

export type FileToDownload = {
  filename: string
  byteSizeBigInt: bigint | number | null
  url?: string
  state?: StateKey
}

const props = defineProps<{
  file: FileToDownload | null
}>()

const downloadable = computed(() => (props.file as FileToDownload)?.state === eState.uploaded)

const handleDownload = async () => {
  if (!props.file?.url) {
    return
  }
  await downloadFile(props.file.url)
}
</script>

<template>
  <button
    v-if="downloadable"
    class="fr-link"
    @click.prevent.stop="handleDownload"
  >
    {{ file?.filename }}
    <em class="text-[var(--grey-625-425)]">({{ prettyByteSizeByString(String(file?.byteSizeBigInt)) }})</em>
  </button>
  <span v-else>
    {{ file?.filename }}
    <DsfrBadge
      v-if="file?.filename"
      no-icon
      small
      label="Non téléchargeable"
      type="error"
    />
  </span>
</template>
