<script lang="ts" setup>
import { getFileRoute } from '@/api/bn-api-routes'
import { baseApiUrl } from '@/api/api-client'
import { downloadFile } from '@/utils/downloadFile'

const props = defineProps<{ params: { value: { uuid: string } } }>()

const errorFile = computed(() => props.params.value.uuid === 'ERROR')
const fileUuid = computed(() => props.params.value.uuid)
const href = computed(() => baseApiUrl + getFileRoute(fileUuid.value))

const handleDownload = async () => {
  if (!fileUuid.value) {
    return
  }
  await downloadFile(fileUuid.value)
}
</script>

<template>
  <div v-if="fileUuid">
    <template v-if="errorFile">
      <VIcon
        style="cursor: not-allowed; color: red"
        name="ri-close-fill"
      />
    </template>
    <template v-else>
      <a
        :href="href"
        download
        target="_blank"
        style="background-image: none"
        class="attachment"
        @click.prevent.stop="handleDownload"
      >
        <VIcon name="ri-external-link-fill" />
      </a>
    </template>
  </div>
</template>

<style scoped>
.attachment:after {
  background: none;
  mask-image: none;
  -webkit-mask-image: none !important;
}
</style>
