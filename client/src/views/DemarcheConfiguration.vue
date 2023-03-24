<script lang="ts" setup>
import { computed } from 'vue'
import type { IDemarcheMappingColumn } from '@/shared/interfaces'
import { ChampValueTypes } from '@/shared/types'
import { enumToDsfrSelectOptions } from '@/utils/enumToDsfrSelectOptions'

const props = withDefaults(defineProps<{
    datas: IDemarcheMappingColumn[]
  }>(), {
  datas: () => ([]),
})
const listType = enumToDsfrSelectOptions(ChampValueTypes)
const demarcheMappingColonnes = computed<IDemarcheMappingColumn[]>(() => props.datas)

</script>

<template>
  <div
    v-for="mappingColonne in demarcheMappingColonnes"
    :key="mappingColonne.id"
  >
    <DsfrInput
      :id="'id-'+mappingColonne.id"
      v-model="mappingColonne.id"
      type="hidden"
    />
    <DsfrInput
      :id="'typeName-'+mappingColonne.id"
      v-model="mappingColonne.typeName"
      type="hidden"
    />
    <DsfrInput
      :id="'typeData-'+mappingColonne.id"
      v-model="mappingColonne.typeData"
      type="hidden"
    />
    <div class="fr-container fr-pb-3v">
      <div class="fr-grid-row">
        <div class="fr-col-1 fr-p-2v">
          <DsfrBadge
            :id="'typeData-'+mappingColonne.id"
            :label="mappingColonne.typeData.toUpperCase()"
            small="small"
            type="info"
          />
        </div>
        <div class="fr-col-1 fr-p-2v">
          <DsfrCheckbox
            :id="'display-'+mappingColonne.id"
            v-model="mappingColonne.display"
            :name="mappingColonne.id"
          />
        </div>
        <div class="fr-col-3 fr-p-2v">
          <DsfrInput
            :id="'labelSource-'+mappingColonne.id"
            v-model="mappingColonne.labelSource"
            type="text"
            disabled="disabled"
          />
        </div>
        <div class="fr-col-3 fr-p-2v">
          <DsfrInput
            :id="'labelBN-'+mappingColonne.id"
            v-model="mappingColonne.labelBN"
            type="text"
            :disabled="!mappingColonne.display"
          />
        </div>
        <div class="fr-col-3 fr-p-2v">
          <DsfrSelect
            :id="'typeValue-'+mappingColonne.id"
            v-model="mappingColonne.typeValue"
            label=""
            :options="listType"
            :disabled="!mappingColonne.display"
          />
        </div>
      </div>
    </div>
  </div>
</template>
