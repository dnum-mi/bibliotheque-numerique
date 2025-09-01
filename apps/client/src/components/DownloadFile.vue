<script setup lang="ts">
import type { File } from '@dnum-mi/ds-api-client'
import { prettyByteSizeByString } from '@/utils'
import { eState } from '@biblio-num/shared'
import type { StateKey } from '@biblio-num/shared'
import { downloadFile } from '@/utils/downloadFile'

const props = defineProps<{
  file: File | null
}>()

const downloadable = computed(() => (props.file as File & { state: StateKey })?.state === eState.uploaded)

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
