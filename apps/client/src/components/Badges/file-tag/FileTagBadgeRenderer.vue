<script lang="ts" setup>
import type { ICellRendererParams } from 'ag-grid-community'

const props = defineProps<{ params: ICellRendererParams }>()

const tag = computed(() => {
  return props.params.value
})
const filterSelectAll = computed(() => {
  return props.params.value === 'Tout sélectionner'
})
</script>

<template>
  <span v-if="filterSelectAll">{{ props.params.value }}</span>
  <FileTagBadge :tag="tag" />
</template>
