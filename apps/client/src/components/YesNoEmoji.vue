<script lang="ts" setup>
defineProps<{
  params: {
    value: boolean
  }
}>()
</script>

<template>
  {{ params.value ? '✅' : '❌' }}
</template>
