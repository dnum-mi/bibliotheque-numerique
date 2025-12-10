<script lang="ts" setup>
import type { INumbersFilterModel } from '@biblio-num/shared'

const props = defineProps<{
  modelValue: unknown
  filterCallback: () => void
  params: { numbers: number[] }
}>()

const emit = defineEmits(['update:modelValue'])

const getDefaultModel = (): INumbersFilterModel => {
  return {
    filterType: 'numbers',
    includeEmpty: true,
    filter: [...(props.params.numbers || [])],
  }
}

const localFilter = computed({
  get: () => {
    return (props.modelValue as INumbersFilterModel) || getDefaultModel()
  },
  set: (val: INumbersFilterModel) => {
    emit('update:modelValue', val)
  },
})

const updateYearsFilter = (checked: boolean, year: number) => {
  const currentFilter = { ...localFilter.value }

  if (checked) {
    currentFilter.filter = [...currentFilter.filter, year]
  } else {
    currentFilter.filter = currentFilter.filter.filter((y) => y !== year)
  }

  localFilter.value = currentFilter
  props.filterCallback()
}

const toggleIncludeEmpty = (checked: boolean) => {
  const currentFilter = { ...localFilter.value }
  currentFilter.includeEmpty = checked
  localFilter.value = currentFilter
  props.filterCallback()
}
</script>

<template>
  <div class="flex flex-col items-left m-2">
    <DsfrCheckbox
      v-model="localFilter.includeEmpty"
      :value="undefined"
      :disabled="!localFilter.filter.length"
      :checked="localFilter.includeEmpty || !localFilter.filter.length"
      label="Aucune"
      small
      name="Aucune"
      @update:model-value="toggleIncludeEmpty($event)"
    />
    <div
      v-for="year in params.numbers"
      :key="year"
    >
      <DsfrCheckbox
        :value="year"
        :model-value="localFilter.filter.includes(year)"
        :label="year.toString()"
        small
        :name="year.toString()"
        @update:model-value="updateYearsFilter($event, year)"
      />
    </div>
  </div>
</template>
