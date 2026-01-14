<script lang="ts" setup>
import type { ICellRendererParams } from '@/components/datatable/server-side/data-table-types'

const props = defineProps<{ params: ICellRendererParams }>()

const tag = computed(() => {
  return props.params.value
})
const filterSelectAll = computed(() => {
  return props.params.value === 'Tout sélectionner'
})
</script>

<template>
  <div class="flex items-center" :title="props.params.value">
    <span v-if="filterSelectAll">{{ props.params.value }}</span>
    <FileTagBadge :tag="tag" />
  </div>
</template>
