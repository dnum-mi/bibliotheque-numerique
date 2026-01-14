<script lang="ts" setup>
import { getIconPropsFromFileState } from '@/components/datatable/files/file.utils'
import type { StateKey } from '@biblio-num/shared'

const props = defineProps<{
  params: {
    value: StateKey
    displayText?: boolean
  }
}>()

const rawIconProps = computed(() => getIconPropsFromFileState(props.params.value))
const iconProps = computed(() => {
  if (!rawIconProps.value) {
    return null
  }
  const { title, ...rest } = rawIconProps.value
  return rest
})
const title = computed(() => rawIconProps.value?.title || '')
const label = computed(() => (props.params.displayText && title.value) || '')
</script>

<template>
  <div class="flex items-center" :title="title">
    <VIcon
      v-if="iconProps?.name"
      v-bind="iconProps"
    />
    <span>{{ label }}</span>
  </div>
</template>
