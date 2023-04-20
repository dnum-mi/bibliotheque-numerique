<template>
  <DsfrButton
    v-show="show"
    data-cy="cell-action-icon"
    :disabled="disabled"
    :icon="icon"
    tertiary="tertiary"
    icon-only
    @click="showElt"
  />
</template>
<script lang="ts" setup>

import type { TIconFunction } from '@/shared/types/typeDataTablele.js'
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label:string,
  disabled: boolean,
  params: any,
}>(), {
  label: '',
  disabled: false,
})

const getIcon = (icon?: string | TIconFunction): string => {
  if (typeof icon === 'function') {
    return icon(props.params.data)
  } else if (typeof icon === 'string') {
    return icon
  }
  return 'ri-search-line'
}

const icon = computed<string>(() => getIcon(props.params.colDef.action?.icon))

const show = props.params.colDef.action?.condition
  ? props.params.colDef.action?.condition(props.params.data)
  : true

const showElt = () => {
  props.params.context.showElt(props.params.data)
}
</script>

<style scoped>

.fr-btn {
  --padding: 0;
}
</style>
