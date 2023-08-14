<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps<{
  params: {
    value: string,
  }
}>()

const value = computed(() => props.params.value)
</script>

<template>
  <div class="text-center">
    <VIcon
      :name="value ? 'ri-check-line' : 'ri-subtract-line'"
      :color="value ? 'green' : 'grey'"
    />
  </div>
</template>
