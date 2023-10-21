<script lang="ts" setup>
import { computed } from 'vue'

const statusDictionary = {
  accepte: { label: 'Accepté', type: 'success' },
  en_construction: { label: 'En construction', type: 'new' },
  en_instruction: { label: 'En instruction', type: 'new' },
  refuse: { label: 'Refusé', type: 'error' },
  sans_suite: { label: 'sans_suite', type: 'warning' },
} as const

const props = defineProps<{
  status: keyof typeof statusDictionary
}>()

const statusLabel = computed(() => {
  return statusDictionary[props.status]?.label || props.status
})
const statusType = computed(() => {
  return statusDictionary[props.status]?.type || 'info'
})
</script>

<template>
  <DsfrBadge
    :label="statusLabel"
    :type="statusType"
    small
    no-icon
  />
</template>
