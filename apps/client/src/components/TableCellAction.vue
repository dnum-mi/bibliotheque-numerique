<script lang="ts" setup>

import type { TIconFunction } from '@/shared/types/typeDataTablele.js'
import { computed } from 'vue'

const props = defineProps<{
  label:string,
  disabled: boolean,
  params: any,
}>()

const getIcon = (icon?: string | TIconFunction): string => {
  if (typeof icon === 'function') {
    return icon(props.params.data)
  }
  if (typeof icon === 'string') {
    return icon
  }
  return 'ri-search-line'
}

const icon = computed<string>(() => getIcon(props.params.action?.icon))

const show = props.params.action?.condition
  ? props.params.action?.condition(props.params.data)
  : true

const showElt = () => {
  props.params.context.showElt(props.params.data)
}
</script>
<template>
  <DsfrButton
    v-show="show"
    :title="params.title"
    data-cy="cell-action-icon"
    :disabled="disabled"
    :icon="icon"
    tertiary
    icon-only
    @click="showElt"
  />
</template>

<style scoped>
.fr-btn {
  --padding: 0;
}
</style>
