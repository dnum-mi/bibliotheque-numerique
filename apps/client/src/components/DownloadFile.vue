<script setup lang="ts">
import type { File } from '@dnum-mi/ds-api-client'
import { prettyByteSizeByString } from '@/utils'
import { getFileRoute } from '../api/bn-api-routes'
import { baseApiUrl } from '../api/api-client'
import { eState, type StateKey } from '@biblio-num/shared'

const props = defineProps<{
  file: File | null
}>()

const url = computed(() => `${baseApiUrl}${getFileRoute(props.file?.url)}`)
const downloadable = computed(() => (props.file as File & { state: StateKey })?.state === eState.uploaded)
</script>

<template>
  <a
    v-if="downloadable"
    download
    :href="url"
    target="_blank"
    class="fr-link"
  >{{ file?.filename }}
    <em class="text-[var(--grey-625-425)]">({{ prettyByteSizeByString(String(file?.byteSizeBigInt)) }})</em>
  </a>
  <span v-else>{{ file?.filename }}
    <DsfrBadge
      v-if="file?.filename"
      no-icon
      small
      label="Non téléchargeable"
      type="error"
    /></span>
</template>
