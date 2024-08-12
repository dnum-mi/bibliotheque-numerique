<script lang="ts" setup>
import type { IMappingColumn } from '@biblio-num/shared'

defineProps<{ champ: IMappingColumn }>()

const emit = defineEmits(['toggleCheck'])

const typeLabels = {
  text: 'Texte',
  number: 'Nombre',
  date: 'Date',
  file: 'Fichier',
  state: 'État',
  boolean: 'Booléen',
  get default () {
    return this.text
  },
} as const

const getFrenchTypeLabel = (type: keyof typeof typeLabels) => {
  return typeLabels[type] || typeLabels.default
}
</script>

<template>
  <DsfrCheckbox
    :id="champ.id"
    name="champ.originalLabel"
    :label="champ.originalLabel"
    :checked="!!champ.columnLabel"
    @update:model-value="emit('toggleCheck', $event)"
  />
  <DsfrBadge
    :label="getFrenchTypeLabel(champ.type)"
    type="none"
  />
</template>
