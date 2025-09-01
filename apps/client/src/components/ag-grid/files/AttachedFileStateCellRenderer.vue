<script lang="ts" setup>
import { getIconPropsFromFileState } from '@/components/ag-grid/files/file.utils'
import type { StateKey } from '@biblio-num/shared'

const props = defineProps<{
  params: {
    value: StateKey
    displayText?: boolean
  }
}>()

const iconProps = computed(() => getIconPropsFromFileState(props.params.value))
const title = computed(() => (props.params.displayText && iconProps.value?.title) || '')
</script>

<template>
  <span class="fr-text--sm">
    <VIcon
      v-if="iconProps?.name"
      v-bind="iconProps"
    />
    {{ title }}
  </span>
</template>
