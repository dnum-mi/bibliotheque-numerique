<script lang="ts">
// ⚠️ This is a custom filter for ag-grid, DO NOT make it a <script setup> as there is a bug with ag-grid and <script setup>
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { IFilterParams } from 'ag-grid-community'
import type { INumbersFilterModel } from '@biblio-num/shared'

type InputModel = INumbersFilterModel | { filterModel: INumbersFilterModel }

export default {
  props: {
    params: {
      type: Object as () => IFilterParams & { numbers: number[] },
      required: true,
    },
  },
  setup (props) {
    if (!props.params.numbers?.length) {
      throw new Error('Numbers filter requires a numbers array')
    }

    const getDefaultModel = (): INumbersFilterModel => ({
      filterType: 'numbers',
      includeEmpty: true,
      filter: [...props.params.numbers],
    })

    const backendFilter: Ref<INumbersFilterModel> = ref(getDefaultModel())

    watch(
      backendFilter,
      () => {
        if (props.params.api) {
          props.params.api.onFilterChanged()
        }
      },
      { deep: true },
    )

    //#region AgGrid methods
    const isFilterActive = () => {
      const isDefault = backendFilter.value.includeEmpty && backendFilter.value.filter.length === props.params.numbers.length
      return !isDefault
    }

    const getModel = () => {
      return isFilterActive() ? backendFilter.value : null
    }

    const setModel = (model: InputModel) => {
      if (model) {
        backendFilter.value = (model as { filterModel?: INumbersFilterModel }).filterModel || model as INumbersFilterModel
      } else {
        backendFilter.value = getDefaultModel()
      }
    }
    //#endregion

    const updateYearsFilter = (value: boolean, year: number) => {
      backendFilter.value.filter = value ? [...backendFilter.value.filter, year] : backendFilter.value.filter.filter((y) => y !== year)
    }

    return {
      yearsFilter: backendFilter,
      updateYearsFilter,
      isFilterActive,
      getModel,
      setModel,
    }
  },
}
</script>

<template>
  <div class="flex flex-col items-left m-2">
    <DsfrCheckbox
      v-model="yearsFilter.includeEmpty"
      :disabled="!yearsFilter.filter.length"
      :checked="yearsFilter.includeEmpty || !yearsFilter.filter.length"
      label="Aucune"
      small
      name="Aucune"
    />
    <div
      v-for="year in params.numbers"
      :key="year"
    >
      <DsfrCheckbox
        :model-value="yearsFilter.filter.includes(year)"
        :label="year.toString()"
        small
        :name="year.toString()"
        @update:model-value="updateYearsFilter($event, year)"
      />
    </div>
  </div>
</template>

<style scoped></style>
