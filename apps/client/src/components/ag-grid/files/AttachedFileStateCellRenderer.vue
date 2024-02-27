<script lang="ts" setup>

import { getIconPropsFromFileState } from '@/components/ag-grid/files/file.utils'
import type { StateKey } from '@biblio-num/shared'

const props = defineProps<{
  params: {
    value: StateKey
  }
}>()

const iconProps = computed(() => getIconPropsFromFileState(props.params.value))
</script>

<template>
  <VIcon
    v-bind="iconProps"
  />
</template>
