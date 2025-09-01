<script lang="ts" setup>
import type { ICellRendererParams } from 'ag-grid-community'

import StatusBadge from './StatusBadge.vue'

const props = defineProps<{ params: ICellRendererParams }>()

const status = computed(() => {
  return props.params.value
})
const filterSelectAll = computed(() => {
  return props.params.value === 'Tout sélectionner'
})
</script>

<template>
  <span v-if="filterSelectAll">{{ props.params.value }}</span>
  <StatusBadge :status="status" />
</template>
