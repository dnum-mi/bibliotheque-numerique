<script lang="ts" setup>
import { useDebounceFn } from '@vueuse/core'
import { ref, watchEffect } from 'vue'

import { useDemarcheStore } from '@/stores'

const props = defineProps<{
  isChildren?: boolean
  isParent?: boolean
  id: string
  type: string
  label: string
  initialLabelBn?: string
}>()

const labelBNInput = ref()
const labelBN = ref(props.initialLabelBn)
const display = ref(!!props.initialLabelBn)

const focusOnInput = () => {
  setTimeout(() => {
    labelBNInput.value.focus()
  })
}

const demarcheStore = useDemarcheStore()
const save = useDebounceFn((id: string, label?: string) => {
  if (!display.value) {
    return
  }
  // Que fait-on si la nouvelle valeur est chaîne vide ?
  demarcheStore.updateOneMappingColumn(id, label || '???')
}, 1000)

watchEffect(() => save(props.id, labelBN.value))
</script>

<template>
  <div class="fr-grid-row">
    <div class="fr-col-1  fr-p-2v">
      <DsfrCheckbox
        v-if="!isParent"
        :id="`display-${id}`"
        v-model="display"
        :name="id"
        class="fr-pt-3v flex  justify-center"
        @click="focusOnInput()"
      />
    </div>
    <div class="fr-col-2  flex  items-center">
      <DsfrBadge
        :id="`type-${id}`"
        :label="type.toUpperCase()"
        small
        type="info"
        class="fr-mr-1w"
      />
      <span
        v-if="isParent"
        class="fr-icon-table-fill   fr-icon--sm"
        aria-hidden="true"
        title="Type de champ: Bloc Répétable"
      />
      <span
        v-if="isChildren"
        class="fr-icon-list-unordered  fr-icon--sm"
        aria-hidden="true"
        title="Le champ dans <Bloc Répétable>"
      />
    </div>
    <div class="fr-col-4  fr-p-2v">
      <DsfrInput
        :id="`labelSource-${id}`"
        :value="label"
        readonly
      />
    </div>
    <div class="fr-col-5  fr-p-2v">
      <DsfrInput
        :id="`labelBN-${id}`"
        ref="labelBNInput"
        v-model="labelBN"
        :disabled="!display"
      />
    </div>
  </div>
</template>
