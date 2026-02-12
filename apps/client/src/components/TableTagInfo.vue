<script setup lang="ts">
defineProps<{
  params: { value: string | null }
}>()
</script>

<template>
  <DsfrTag
    v-if="params.value"
    :label="params.value"
    small
    selectable
  />
</template>
