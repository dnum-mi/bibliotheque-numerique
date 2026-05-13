<script lang="ts" setup>
import type { BNColDef } from './bn-col-def.interface'

import { computed, ref } from 'vue'
import { useEventListener } from '@vueuse/core'

const props = defineProps<{ columnDefs: BNColDef[] }>()
const emit = defineEmits<{ close: [] }>()
const selected = defineModel<string[]>({ default: [] })

//#region 📍------ Helpers: admin order ------ 📍
const getAdminIndex = (id: string) => (props.columnDefs ?? []).findIndex((c) => !c.hide && c.field === id)

const insertByAdminOrder = (current: string[], idToAdd: string) => {
  if (current.includes(idToAdd)) {
    return current
  }

  const adminIdx = getAdminIndex(idToAdd)
  if (adminIdx === -1) {
    return [...current, idToAdd]
  }

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
//#endregion

//#region 📍------ State: selection & DnD ------ 📍
const selectedSet = computed(() => new Set(selected.value))

type DropPosition = 'above' | 'below'
const draggingId = ref<string | null>(null)

// “où je suis en train de survoler” + “au-dessus/au-dessous”
const dropTargetId = ref<string | null>(null)
const dropPosition = ref<DropPosition>('below')

//#endregion

//#region 📍------ Helpers: array move (with before/after) ------ 📍
function moveWithPosition (arr: string[], from: number, to: number, pos: DropPosition): string[] {
  if (from === to) {
    return arr
  }

  const next = arr.slice()
  const [item] = next.splice(from, 1)
  if (!item) {
    return arr
  }

  // Si on a retiré un élément avant l’index cible, l’index “to” se décale de -1
  const adjustedTo = from < to ? to - 1 : to

  const insertAt = pos === 'below' ? adjustedTo + 1 : adjustedTo
  next.splice(insertAt, 0, item)
  return next
}

function computeDropPosition (e: DragEvent, el: HTMLElement): DropPosition {
  const rect = el.getBoundingClientRect()
  const mid = rect.top + rect.height / 2
  return (e.clientY ?? 0) < mid ? 'above' : 'below'
}

//#endregion

//#region 📍------ DnD handlers ------ 📍
function onDragStart (field: string, e: DragEvent) {
  draggingId.value = field
  dropTargetId.value = null

  // Firefox needs some data
  e.dataTransfer?.setData('text/plain', field)
  e.dataTransfer?.setData('application/x-col-id', field)
  e.dataTransfer!.effectAllowed = 'move'
}

function onDragEnd () {
  draggingId.value = null
  dropTargetId.value = null
}

function onDragOverRow (targetField: string, e: DragEvent) {
  e.preventDefault()

  const dragged = draggingId.value || e.dataTransfer?.getData('application/x-col-id') || e.dataTransfer?.getData('text/plain')

  if (!dragged || dragged === targetField) {
    dropTargetId.value = null
    return
  }

  // On ne dnd que sur les sélectionnées
  if (!selectedSet.value.has(dragged) || !selectedSet.value.has(targetField)) {
    dropTargetId.value = null
    return
  }

  dropTargetId.value = targetField
  dropPosition.value = computeDropPosition(e, e.currentTarget as HTMLElement)

  if (e.dataTransfer) {
    e.dataTransfer.dropEffect = 'move'
  }
}

function onDragLeaveRow (targetField: string) {
  // Si on quitte la row actuellement target, on enlève l’indicateur
  if (dropTargetId.value === targetField) {
    dropTargetId.value = null
  }
}

function onDropOnSelected (targetField: string, e: DragEvent) {
  e.preventDefault()

  const dragged = draggingId.value || e.dataTransfer?.getData('application/x-col-id') || e.dataTransfer?.getData('text/plain')

  if (!dragged || dragged === targetField) {
    return
  }
  if (!selectedSet.value.has(dragged)) {
    return
  }
  if (!selectedSet.value.has(targetField)) {
    return
  }

  const cur = [...selected.value]
  const from = cur.indexOf(dragged)
  const to = cur.indexOf(targetField)
  if (from === -1 || to === -1) {
    return
  }

  selected.value = moveWithPosition(cur, from, to, dropPosition.value)

  draggingId.value = null
  dropTargetId.value = null
}

//#endregion

//#region 📍------ UI events: toggle + close ------ 📍
function toggle (field: string, checked: boolean) {
  const cur = Array.isArray(selected.value) ? selected.value : []

  if (checked) {
    selected.value = insertByAdminOrder(cur, field)
  } else {
    selected.value = cur.filter((x) => x !== field)
  }
}

const columnListRef = useTemplateRef('columnListRef')

useEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    emit('close')
  }
})

useEventListener(document, 'click', (event: MouseEvent) => {
  if (columnListRef.value && !columnListRef.value.contains(event.target as Node)) {
    emit('close')
  }
})
//#endregion
</script>

<template>
  <div
    ref="columnListRef"
    class="overflow-auto"
  >
    <div class="mb-2 font-bold">
      Liste des colonnes
    </div>

    <ul class="m-0 p-0 list-none">
      <template
        v-for="col of columnDefs"
        :key="col.field"
      >
        <!-- @vue-ignore TODO: corriger le type -->
        <li
          v-if="!col.hide && col.field"
          class="flex items-center gap-2 py-1 bn-colrow"
          :draggable="selected.includes(col.field)"
          :class="{
            'bn-drop-target': dropTargetId === col.field,
            'bn-drop-above': dropTargetId === col.field && dropPosition === 'above',
            'bn-drop-below': dropTargetId === col.field && dropPosition === 'below',
          }"
          @dragstart="selected.includes(col.field) ? onDragStart(col.field, $event) : undefined"
          @dragend="selected.includes(col.field) ? onDragEnd() : undefined"
          @dragover="selected.includes(col.field) ? onDragOverRow(col.field, $event) : undefined"
          @dragleave="selected.includes(col.field) ? onDragLeaveRow(col.field, $event) : undefined"
          @drop="selected.includes(col.field) ? onDropOnSelected(col.field, $event) : undefined"
        >
          <span
            v-if="selected.includes(col.field)"
            class="bn-grab"
            title="Glisser pour réordonner"
            aria-hidden="true"
          >⋮⋮</span>

          <input
            :id="`col-${col.field}`"
            class="fr-checkbox__input"
            type="checkbox"
            :checked="selected.includes(col.field)"
            @change="toggle(col.field, ($event.target as HTMLInputElement).checked)"
          >
          <label
            class="fr-checkbox__label"
            :for="`col-${col.field}`"
          >
            {{ col.headerName }}
          </label>
        </li>
      </template>
    </ul>
  </div>
</template>

<style scoped>
.bn-grab {
  cursor: grab;
  user-select: none;
  opacity: 0.6;
  line-height: 1;
}

li[draggable='true'] {
  cursor: grab;
}

li[draggable='true']:active {
  cursor: grabbing;
}

/* --- Drop indicator line --- */
.bn-colrow {
  position: relative;
}

.bn-drop-above::before,
.bn-drop-below::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: #2a6df4; /* simple, lisible */
}

.bn-drop-above::before {
  top: 0;
}

.bn-drop-below::after {
  bottom: 0;
}
</style>
