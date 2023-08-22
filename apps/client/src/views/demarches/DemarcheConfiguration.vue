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
}).slice().sort((
  { labelSource: [labelA, supLabelA] },
  { labelSource: [labelB, supLabelB] },
) => {
  if (supLabelA && supLabelB) {
    return (labelA + supLabelA) > (labelB + supLabelB) ? 1 : -1
  }
  return labelA > labelB ? 1 : -1
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
  <ul class="list-none p-0 m-0">
    <li
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
      <div class="fr-container">
        <div class="fr-grid-row">
          <div class="fr-col-1  fr-p-2v">
            <DsfrCheckbox
              v-if="mappingColumn.typeName != TypeDeChampDS.REPETITION"
              :id="`display-${mappingColumn.id}`"
              v-model="mappingColumn.display"
              :name="mappingColumn.id"
              class="fr-pt-3v flex  justify-center"
              @click="focusOn($event)"
            />
          </div>
          <div class="fr-col-2  flex  items-center">
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
              :model-value="mappingColumn.labelSource.at(-1)"
              readonly
              @update:model-value="mappingColumn.labelSource = $event"
            />
          </div>
          <div class="fr-col-5  fr-p-2v">
            <DsfrInput
              :id="`labelBN-${mappingColumn.id}`"
              v-model="mappingColumn.labelBN"
              :disabled="!mappingColumn.display"
            />
          </div>
        </div>
      </div>
    </li>
  </ul>
</template>

<style scoped>
.fr-label + .fr-input {
  margin-top: 0;
}

.truncate {
  display: inline-block;
  width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 1.25rem;
  vertical-align: top;
}
</style>
