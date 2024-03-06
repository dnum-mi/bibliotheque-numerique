<script lang="ts" setup>

import { dFileTabDictionary, type FileTagKey } from '@biblio-num/shared'

const props = defineProps<{
  tag: FileTagKey
}>()

const statusLabel = computed(() => {
  return dFileTabDictionary[props.tag]
})
const statusType = computed(() => {
  return 'info'
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
