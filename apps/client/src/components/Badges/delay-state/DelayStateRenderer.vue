<script lang="ts" setup>
import type { ICellRendererParams } from 'ag-grid-community'

const props = defineProps<{ params: ICellRendererParams }>()

const value = computed(() => {
  return props.params.value
})
const isFilterSelectAll = computed(() => {
  return props.params.value === 'Tout sélectionner'
})
const isFilterEmpty = computed(() => {
  return !props.params.value
})
</script>

<template>
  <span v-if="isFilterSelectAll">{{ props.params.value }}</span>
  <span v-if="isFilterEmpty">Pas de délai</span>
  <DelayStateBadge :value="value" />
</template>
