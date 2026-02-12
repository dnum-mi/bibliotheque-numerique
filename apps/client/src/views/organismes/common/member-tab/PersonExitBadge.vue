<script setup lang="ts">
import { dateToStringFr } from '@/utils'

const props = defineProps<{
  params: {
    value: string | Date | null
  }
}>()

const formattedDate = computed(() => {
  if (!props.params.value) {
    return ''
  }
  return dateToStringFr(props.params.value)
})
</script>

<template>
  <DsfrBadge
    v-if="params.value"
    :label="formattedDate"
    type="error"
    small
    no-icon
  />
  <span v-else>-</span>
</template>
