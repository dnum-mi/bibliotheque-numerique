<script lang="ts" setup>
import type { FileMimeTypeKey } from '@biblio-num/shared/dist/src/index'
import { getIconNameFromMimeType } from '@/components/ag-grid/files/file.utils'

const props = defineProps<{
  params: {
    value: FileMimeTypeKey
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
    />
  </div>
</template>
