<script lang="ts">
// ⚠️ This is a custom filter for ag-grid, DO NOT make it a <script setup> as there is a bug with ag-grid and <script setup>
import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import type { IFilterParams } from 'ag-grid-community'
import type { IStringsFilterModel } from '@biblio-num/shared'

type InputModel = IStringsFilterModel | { filterModel: IStringsFilterModel }

export default {
  props: {
    params: {
      type: Object as () => IFilterParams & { strings: string[] },
      required: true,
    },
  },
  setup (props) {
    if (!props.params.strings?.length) {
      throw new Error('Numbers filter requires a numbers array')
    }

    const getDefaultModel = (): IStringsFilterModel => ({
      filterType: 'strings',
      includeEmpty: true,
      filter: [...props.params.strings],
    })

    const backendFilter: Ref<IStringsFilterModel> = ref(getDefaultModel())

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
      const isDefault = backendFilter.value.includeEmpty && backendFilter.value.filter.length === props.params.strings.length
      return !isDefault
    }

    const getModel = () => {
      return isFilterActive() ? backendFilter.value : null
    }

    const setModel = (model: InputModel) => {
      if (model) {
        backendFilter.value = (model as { filterModel?: IStringsFilterModel }).filterModel || (model as IStringsFilterModel)
      } else {
        backendFilter.value = getDefaultModel()
      }
    }
    //#endregion

    const updateStringsFilter = (value: boolean, text: string) => {
      backendFilter.value.filter = value ? [...backendFilter.value.filter, text] : backendFilter.value.filter.filter((y) => y !== text)
    }

    return {
      stringsFilter: backendFilter,
      updateStringsFilter,
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
      v-model="stringsFilter.includeEmpty"
      :disabled="!stringsFilter.filter.length"
      :checked="stringsFilter.includeEmpty || !stringsFilter.filter.length"
      label="Aucune"
      small
      value="Aucune"
      name="Aucune"
    />
    <div
      v-for="value in params.strings"
      :key="value"
    >
      <DsfrCheckbox
        :model-value="stringsFilter.filter.includes(value)"
        :label="value"
        small
        :name="value"
        :value="value"
        @update:model-value="updateStringsFilter($event, value)"
      />
    </div>
  </div>
</template>
