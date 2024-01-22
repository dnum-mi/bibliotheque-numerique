<script lang="ts" setup>
import { type Ref, ref, watch } from 'vue'
import type { DateRangeKeys } from '@biblio-num/shared'
import { type IFilterParams } from 'ag-grid-community'

type RangeModel = Ref<DateRangeKeys | null>
const rangeDictionary: Record<DateRangeKeys, string> = {
  TwentyFourHours: 'Depuis 24 heures',
  ThreeDays: 'Depuis 3 jours',
  OneWeek: 'Depuis 1 semaine',
  TwoWeeks: 'Depuis 2 semaines',
  OneMonth: 'Depuis 1 mois',
  ThreeMonths: 'Depuis 3 mois',
  SixMonths: 'Depuis 6 mois',
  OneYear: 'Depuis 1 an',
}

const props = defineProps<{ params: IFilterParams }>()

const selectedRange: RangeModel = ref(null)

watch(selectedRange, () => {
  if (props.params.api) {
    props.params.api.onFilterChanged()
  }
})

//#region AgGrid methods
const isFilterActive = () => {
  return selectedRange.value !== null
}

const getModel = () => {
  return { value: selectedRange.value }
}

const setModel = (model: RangeModel) => {
  selectedRange.value = model?.value || null
}
//#endregion

</script>

<template>
  <div class="flex flex-col items-center m-4">
    <select
      v-model="selectedRange"
    >
      <option :value="null">
        Choisir une période
      </option>
      <option
        v-for="(traduction, key) in rangeDictionary"
        :key="key"
        :value="key"
      >
        {{ traduction }}
      </option>
    </select>
  </div>
</template>

<style scoped>
</style>
