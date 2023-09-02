<script lang="ts" setup>
import { useDebounceFn } from '@vueuse/core'
import { ref, watch } from 'vue'

import { useDemarcheStore } from '@/stores'
import type { MappingColumn } from '@biblio-num/shared'

const props = defineProps<{
  isChildren?: boolean;
  mappingColumn: MappingColumn;
}>()

const emits = defineEmits(['columnUpdated'])

const labelBNInput = ref()
const labelBN = ref(props.mappingColumn.columnLabel)
const checked = ref(!!labelBN.value)
const isParent = !props.isChildren && props.mappingColumn.children?.length

const focusOnInput = () => {
  setTimeout(() => {
    labelBNInput.value.focus()
  })
}

const demarcheStore = useDemarcheStore()
const save = useDebounceFn(async (id: string, label: string | null) => {
  await demarcheStore.updateOneMappingColumn(id, label)
  if (label) {
    emits('columnUpdated')
  }
  // TODO: un petit toast pour le comfort utilisateur
}, 2000)

watch(checked, (newValue) => {
  if (newValue) {
    labelBN.value = ''
    focusOnInput()
  } else {
    labelBN.value = null
  }
  save(props.mappingColumn.id, labelBN.value)
})
</script>

<template>
  <div
    class="fr-col-1 fr-p-2v"
  >
    <DsfrCheckbox
      v-if="!isParent"
      :id="`display-${props.mappingColumn.id}`"
      v-model="checked"
      :name="props.mappingColumn.id"
      class="fr-pt-2v flex justify-center"
      :class="{ 'fr-ml-10v': isChildren }"
      @click="focusOnInput()"
    />
    <span
      v-if="isParent"
      class="fr-icon-table-fill  fr-icon--md  fr-pt-3v  fr-mr-2v  flex  justify-center  align-center"
      aria-hidden="true"
      title="Type de champ: Bloc Répétable"
    />
  </div>
  <div class="fr-col-1  flex  items-center">
    <DsfrBadge
      :id="`type-${props.mappingColumn.id}`"
      :label="isParent ? 'Répétable' : mappingColumn.type?.toUpperCase()"
      small
      type="info"
      class="fr-mr-1w"
    />
  </div>
  <div class="fr-col-5  fr-p-2v  flex  items-center">
    <p
      :id="`labelSource-${props.mappingColumn.id}`"
      class="fr-m-0 ellipsis"
      :title="mappingColumn.originalLabel"
    >
      {{ mappingColumn.originalLabel }}
    </p>
  </div>
  <div class="fr-col-5 fr-p-2v">
    <DsfrInput
      :id="`labelBN-${props.mappingColumn.id}`"
      ref="labelBNInput"
      v-model="labelBN"
      class="fr-m-0"
      :disabled="!checked"
      @update:model-value="save(props.mappingColumn.id, labelBN)"
    />
  </div>
</template>

<style>
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
