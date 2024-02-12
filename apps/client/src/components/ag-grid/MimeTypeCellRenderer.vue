<script lang="ts" setup>
import { getIconNameFromMimeType } from '@biblio-num/shared-utils'

const props = defineProps<{
  params: {
    value: string
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
