<script lang="ts" setup>
import { dossierStatusDictionary } from '@/shared/dictionaries/dossier-status.dictionary.ts'
import type { DossierStateKeys } from '@biblio-num/shared'

const props = defineProps<{
  status: DossierStateKeys
}>()

const statusLabel = computed(() => {
  return dossierStatusDictionary[props.status]?.label || props.status
})
const statusType = computed(() => {
  return dossierStatusDictionary[props.status]?.type || 'info'
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
