<script lang="ts" setup>
const props = defineProps<{
  value: string
}>()

 type dsfrType = 'success' | 'error' | 'warning' | 'info' | 'new'

const dictionary: Record<string, { label: string, type: dsfrType }> = {
  '1ère demande': { label: '1ère demande', type: 'new' },
  'Intention opposition': { label: 'Intention opposition', type: 'warning' },
  Erreur: { label: 'Erreur', type: 'error' },
  Prorogation: { label: 'Prorogation', type: 'warning' },
  Instruction: { label: 'Instruction', type: 'info' },
  'Délai expiré': { label: 'Délai expiré', type: 'error' },
  '2ème demande': { label: '2ème demande', type: 'new' },
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
