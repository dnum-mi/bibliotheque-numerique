<script lang="ts" setup>
import type { ICellRendererParams } from 'ag-grid-community'

import RoleBadge from '@/components/Badges/role/RoleBadge.vue'

const props = defineProps<{ params: ICellRendererParams }>()

const filterSelectAll = computed(() => {
  return props.params.value === 'Tout sélectionner'
})
</script>

<template>
  <span v-if="filterSelectAll">{{ props.params.value }}</span>
  <RoleBadge :role="params.value" />
</template>

<style>
</style>
