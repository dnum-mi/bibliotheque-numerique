<script lang="ts" setup>
import { computed } from 'vue'

import CheckRenderer from './CheckRenderer.vue'

const props = defineProps<{
  params: {
    value: {
      stringValue: string
    }[]
  }
}>()

const params = computed(() => ({ value: props.params.value ? props.params.value[0].stringValue : '' }))
</script>

<template>
  <CheckRenderer :params="params" />
</template>
