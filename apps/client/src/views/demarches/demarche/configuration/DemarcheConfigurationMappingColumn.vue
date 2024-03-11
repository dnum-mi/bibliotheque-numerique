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

const labelBNInput = ref<HTMLElement | null | undefined>()
const labelBN = ref<string | undefined>(props.mappingColumn.columnLabel)
const checked = ref(!!labelBN.value)
const isParent = !props.isChildren && props.mappingColumn.children?.length

const focusOnInput = () => {
  if (checked.value) {
    labelBN.value = labelBN.value || props.mappingColumn.originalLabel
  }
  setTimeout(() => {
    labelBNInput.value?.focus()
  })
}

const demarcheStore = useDemarcheStore()
const save = useDebounceFn(async (id: string, label: string | null) => {
  await demarcheStore.updateOneMappingColumn(id, label ?? null)
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
    labelBN.value = undefined
  }
  save(props.mappingColumn.id, labelBN.value ?? null)
})

const uncheck = (id: string) => {
  console.log('uncheck', id)
}
</script>

<template>
  <div
    class="fr-p-2v  flex  justify-between  items-center"
  >
    <div class="flex  gap-8  items-center">
      <div>
        <DsfrButton
          :id="`display-${props.mappingColumn.id}`"
          :name="props.mappingColumn.id"
          icon="ri-close-line"
          size="sm"
          icon-only
          style="padding: 0.175rem  0.375rem"
          @click="uncheck(props.mappingColumn.id)"
        />
      </div>
      <span
        v-if="isParent"
        class="fr-icon-table-fill  fr-icon--md  fr-pt-3v  fr-mr-2v  flex  justify-center  align-center"
        aria-hidden="true"
        title="Type de champ: Bloc Répétable"
      />
      <p
        :id="`labelSource-${props.mappingColumn.id}`"
        class="fr-m-0  ellipsis  text-lg  line-height-[2rem]"
        :title="mappingColumn.originalLabel"
      >
        {{ mappingColumn.originalLabel }}
      </p>
    </div>
    <div class="fr-col-5">
      <DsfrInput
        :id="`labelBN-${props.mappingColumn.id}`"
        ref="labelBNInput"
        v-model="labelBN"
        class="fr-m-0"
        :disabled="!checked"
        @update:model-value="save(props.mappingColumn.id, labelBN ?? null)"
      />
    </div>
  </div>
</template>

<style>
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
