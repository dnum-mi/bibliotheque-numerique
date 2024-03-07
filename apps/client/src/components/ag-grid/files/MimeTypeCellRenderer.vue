<script lang="ts" setup>
import type { FileExtensionKey } from '@biblio-num/shared'
import { getIconNameFromMimeType } from '@/components/ag-grid/files/file.utils'

const props = defineProps<{
  params: {
    value: FileExtensionKey
    displayText?: boolean
    dict: Record<FileExtensionKey, string>
  }
}>()

const iconName = computed(() => getIconNameFromMimeType(props.params.value))
</script>

<template>
  <div class="flex  items-center">
    <VIcon
      :name="iconName"
      scale="1.5"
      :title="props.params.value"
      class="mr-1"
    />
    {{ params.displayText ? params.dict[params.value] : '' }}
  </div>
</template>
