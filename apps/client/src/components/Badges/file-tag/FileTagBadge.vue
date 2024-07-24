<script lang="ts" setup>
import { dFileTabDictionary, type FileTagKey } from '@biblio-num/shared'

const props = defineProps<{
  tag: FileTagKey
}>()

const statusLabel = computed(() => {
  return dFileTabDictionary[props.tag] || 'Sans tag'
})
const statusType = computed(() => {
  return dFileTabDictionary[props.tag] ? 'info' : 'new'
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
