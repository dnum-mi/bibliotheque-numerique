<script lang="ts" setup>
import { useEventListener } from '@vueuse/core'
import type { BNColDef } from './bn-col-def.interface'
import { DsfrCheckbox } from '@gouvminint/vue-dsfr'

defineProps<{
  columnDefs: BNColDef[]
}>()

const emit = defineEmits<{
  close: []
}>()

const selected = defineModel<string[]>()

useEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    emit('close')
  }
})
const columnListRef = useTemplateRef('columnListRef')
useEventListener(document, 'click', (event: MouseEvent) => {
  // Vérifier si le clic est en dehors du composant
  if (columnListRef.value && !columnListRef.value.contains(event.target as Node)) {
    emit('close')
  }
})
</script>

<template>
  <div
    ref="columnListRef"
    class="overflow-auto"
  >
    Liste des colonnes

    <ul>
      <li v-for="col of columnDefs" :key="col.field" class="flex justify-start">
        <DsfrCheckbox
          v-model="selected"
          legend="Liste des colonnes à afficher"
          name="column"
          :value="col.field"
          :label="col.headerName"
        />
      </li>
    </ul>
  </div>
</template>
