<script lang="ts" setup>
import { computed, nextTick } from 'vue'
import type { IDemarcheMappingColumn } from '@/shared/interfaces'
import { ChampType, ChampValueBaseTypes, ChampValueTypes, ChampValueTypesKeys, TypeDeChampDS } from '@/shared/types'
import { enumToDsfrSelectOptions } from '@/utils/enumToDsfrSelectOptions'

const props = withDefaults(defineProps<{
    datas: IDemarcheMappingColumn[]
  }>(), {
  datas: () => ([]),
})
const listType = enumToDsfrSelectOptions(ChampValueTypes)
const listTypeInstructionTime = enumToDsfrSelectOptions(ChampValueBaseTypes)
const demarcheMappingColumns = computed<IDemarcheMappingColumn[]>(() => props.datas.map(data => {
  data.typeValue = data.typeValue || ChampValueTypesKeys.TEXT
  return data
}))

const focusOn = async ($event: (InputEvent & {target: { checked: boolean; id: string}})) => {
  if ($event.target?.checked) {
    setTimeout(() => {
      (document.getElementById($event.target.id.replace('display', 'labelBN')) as HTMLInputElement).focus()
    })
  }
}
</script>

<template>
  <div
    v-for="mappingColumn in demarcheMappingColumns"
    :key="mappingColumn.id"
  >
    <DsfrInput
      :id="`id-${mappingColumn.id}`"
      v-model="mappingColumn.id"
      type="hidden"
    />
    <DsfrInput
      :id="`typeName-${mappingColumn.id}`"
      v-model="mappingColumn.typeName"
      type="hidden"
    />
    <DsfrInput
      :id="`typeData-${mappingColumn.id}`"
      v-model="mappingColumn.typeData"
      type="hidden"
    />
    <div class="fr-container fr-pb-3v">
      <div class="fr-grid-row">
        <div class="fr-col-1  fr-p-2v  fr-mt-3w  fr-pl-4w">
          <DsfrCheckbox
            v-if="mappingColumn.typeName != TypeDeChampDS.REPETITION"
            :id="`display-${mappingColumn.id}`"
            v-model="mappingColumn.display"
            :name="mappingColumn.id"
            @click="focusOn($event)"
          />
        </div>
        <div class="fr-col-1  fr-p-2v  fr-mt-3w">
          <DsfrBadge
            :id="`typeData-${mappingColumn.id}`"
            :label="mappingColumn.typeData.toUpperCase()"
            small
            type="info"
            class="fr-mr-1w"
          />
          <span
            v-if="mappingColumn.typeName === TypeDeChampDS.REPETITION"
            class="fr-icon-table-fill   fr-icon--sm"
            aria-hidden="true"
            title="Type de champ: Bloc Répétable"
          />
          <span
            v-if="mappingColumn.labelSource.length > 1"
            class="fr-icon-list-unordered  fr-icon--sm"
            aria-hidden="true"
            title="Le champ dans <Bloc Répétable>"
          />
        </div>
        <div class="fr-col-4  fr-p-2v">
          <DsfrInput
            :id="`labelSource-${mappingColumn.id}`"
            :model-value="mappingColumn.labelSource.slice(-1).toString()"
            is-textarea
            disabled="disabled"
            @update:model-value="mappingColumn.labelSource = $event"
          />
        </div>
        <div class="fr-col-6  fr-p-2v">
          <DsfrInput
            :id="`labelBN-${mappingColumn.id}`"
            v-model="mappingColumn.labelBN"
            is-textarea
            :disabled="!mappingColumn.display"
          />
        </div>
      </div>
    </div>
  </div>
</template>
