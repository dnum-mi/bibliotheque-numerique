<script lang="ts" setup>
import type { BNColDef } from './bn-col-def.interface'
import { useEventListener } from '@vueuse/core'

const props = defineProps<{ columnDefs: BNColDef[] }>()
const emit = defineEmits<{ close: [] }>()

const selected = defineModel<string[]>({ default: [] })

const getAdminIndex = (id: string) =>
  (props.columnDefs ?? []).findIndex((c) => !c.hide && c.field === id)

const insertByAdminOrder = (current: string[], idToAdd: string) => {
  // si déjà présent, rien
  if (current.includes(idToAdd)) {
    return current
  }

  const adminIdx = getAdminIndex(idToAdd)
  if (adminIdx === -1) {
    return [...current, idToAdd]
  } // fallback

  // on cherche la prochaine colonne "déjà sélectionnée" après idToAdd dans l’ordre admin
  const after = props.columnDefs
    .filter((c) => !c.hide && c.field)
    .slice(adminIdx + 1)
    .map((c) => c.field!)
    .find((id) => current.includes(id))

  if (!after) {
    return [...current, idToAdd]
  }

  const insertAt = current.indexOf(after)
  return [...current.slice(0, insertAt), idToAdd, ...current.slice(insertAt)]
}

const toggle = (field: string, checked: boolean) => {
  const cur = Array.isArray(selected.value) ? selected.value : []

  if (checked) {
    selected.value = insertByAdminOrder(cur, field)
  } else {
    selected.value = cur.filter((x) => x !== field)
  }
}

useEventListener('keydown', (event) => {
  if (event.key === 'Escape') { emit('close') }
})

const columnListRef = useTemplateRef('columnListRef')
useEventListener(document, 'click', (event: MouseEvent) => {
  if (columnListRef.value && !columnListRef.value.contains(event.target as Node)) {
    emit('close')
  }
})
</script>

<template>
  <div ref="columnListRef" class="overflow-auto">
    <div class="mb-2 font-bold">
      Liste des colonnes
    </div>

    <ul class="m-0 p-0 list-none">
      <li
        v-for="col of columnDefs"
        :key="col.field"
        class="flex items-center gap-2 py-1"
      >
        <template v-if="!col.hide && col.field">
          <input
            :id="`col-${col.field}`"
            class="fr-checkbox__input"
            type="checkbox"
            :checked="selected.includes(col.field)"
            @change="toggle(col.field, ($event.target as HTMLInputElement).checked)"
          >
          <label class="fr-checkbox__label" :for="`col-${col.field}`">
            {{ col.headerName }}
          </label>
        </template>
      </li>
    </ul>
  </div>
</template>
