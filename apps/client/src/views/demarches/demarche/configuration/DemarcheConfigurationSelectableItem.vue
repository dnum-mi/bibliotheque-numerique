<script lang="ts" setup>
import type { MappingColumn } from '@biblio-num/shared'

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

defineProps<{ champ: MappingColumn }>()

const emit = defineEmits(['toggleCheck'])
</script>

<template>
  <DsfrCheckbox
    :id="champ.id"
    :label="champ.originalLabel"
    :checked="!!champ.columnLabel"
    @update:model-value="emit('toggleCheck', $event)"
  />
  <DsfrBadge
    :label="getFrenchTypeLabel(champ.type)"
    :type="'none'"
  />
</template>
