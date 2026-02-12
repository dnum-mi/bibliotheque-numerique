<script setup lang="ts">
defineProps<{
  params: {
    value: boolean
  }
}>()
</script>

<template>
  <DsfrBadge
    v-if="params.value"
    label="Fondateur"
    type="new"
    small
    no-icon
  />
</template>
