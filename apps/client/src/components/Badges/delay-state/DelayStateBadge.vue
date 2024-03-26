<script lang="ts" setup>
import { eInstructionTimeValue } from '@biblio-num/shared'
import type { InstructionTimeValueKey } from '@biblio-num/shared'

const props = defineProps<{
  value: InstructionTimeValueKey
}>()

 type dsfrType = 'success' | 'error' | 'warning' | 'info' | 'new'

const dictionary: Record<InstructionTimeValueKey, { label: string, type: dsfrType }> = {
  [eInstructionTimeValue['1ère demande']]: { label: '1ère demande', type: 'new' },
  [eInstructionTimeValue['Intention opposition']]: { label: 'Intention opposition', type: 'warning' },
  [eInstructionTimeValue.Erreur]: { label: 'Erreur', type: 'error' },
  [eInstructionTimeValue.Prorogation]: { label: 'Prorogation', type: 'warning' },
  [eInstructionTimeValue.Instruction]: { label: 'Instruction', type: 'info' },
  [eInstructionTimeValue['Délai expiré']]: { label: 'Délai expiré', type: 'error' },
  [eInstructionTimeValue['2ème demande']]: { label: '2ème demande', type: 'new' },
}

const state = computed(() => {
  return dictionary[props.value] || { label: props.value, type: 'info' }
})
</script>

<template>
  <DsfrBadge
    v-if="state.label"
    no-icon
    small
    :label="state.label"
    :type="state.type"
  />
</template>
