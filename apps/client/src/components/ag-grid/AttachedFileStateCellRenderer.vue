<script lang="ts" setup>
import { getIconPropsFromFileState } from '@biblio-num/shared'

const props = defineProps<{
  params: {
    value: string
  }
}>()

const iconProps = computed(() => getIconPropsFromFileState(props.params.value))
</script>

<template>
  <VIcon
    v-bind="iconProps"
  />
</template>
