<script lang="ts" setup>
import type { IStringsFilterModel } from '@biblio-num/shared'

const props = defineProps<{
  modelValue: unknown
  filterCallback: () => void
  params: { strings: string[]; cellRenderer: any }
}>()

const emit = defineEmits(['update:modelValue'])

const getDefaultModel = (): IStringsFilterModel => ({
  filterType: 'strings',
  includeEmpty: true,
  filter: [...(props.params.strings || [])],
})

const localFilter = computed({
  get: () => {
    return (props.modelValue as any) || getDefaultModel()
  },
  set: (val: any) => {
    emit('update:modelValue', val)
  },
})

const updateFilter = (checked: boolean, value: string) => {
  const currentFilter = { ...localFilter.value }

  if (checked) {
    currentFilter.filter = [...currentFilter.filter, value]
  } else {
    currentFilter.filter = currentFilter.filter.filter((v: string) => v !== value)
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

onMounted(() => {
  console.log(props.params)
})
</script>

<template>
  <div class="flex flex-col items-left m-2 p-2 min-w-[150px] max-h-[300px] overflow-y-auto">
    <DsfrCheckbox
      v-model="localFilter.includeEmpty"
      :disabled="!localFilter.filter.length"
      :checked="localFilter.includeEmpty || !localFilter.filter.length"
      label="Aucune"
      small
      :value="undefined"
      name="Aucune"
      @update:model-value="toggleIncludeEmpty($event)"
    />
    <div
      v-for="value in params.strings"
      :key="value"
    >
      <DsfrCheckbox
        :model-value="localFilter.filter.includes(value)"
        small
        :name="value"
        :value="value"
        @update:model-value="updateFilter($event, value)"
      >
        <template #label>
          <component
            :is="params.cellRenderer"
            v-if="params.cellRenderer"
            :params="{ value }"
          />
          <span v-else>{{ value }}</span>
        </template>
      </DsfrCheckbox>
    </div>
  </div>
</template>

<style scoped>
</style>
