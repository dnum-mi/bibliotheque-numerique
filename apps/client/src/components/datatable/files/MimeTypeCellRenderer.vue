<script lang="ts" setup>
import type { FileExtensionKey } from '@biblio-num/shared'
import { getIconNameFromMimeType } from '@/components/datatable/files/file.utils'

const props = defineProps<{
  params: {
    value: FileExtensionKey
    displayText?: boolean
    dict?: Record<FileExtensionKey, string>
  }
}>()

const iconName = computed(() => getIconNameFromMimeType(props.params.value))
const label = computed(() => props.params.dict?.[props.params.value] ?? props.params.value)
</script>

<template>
  <div
    class="flex items-center"
    :title="label"
  >
    <VIcon
      :name="iconName"
      scale="1.5"
      class="mr-1"
    />
    {{ params.displayText ? label : '' }}
  </div>
</template>
