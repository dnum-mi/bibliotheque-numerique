<script lang="ts" setup>
import type { Component } from 'vue'

interface SetFilterModel {
  filterType: string
  includeEmpty: boolean
  filter: (string | number)[]
}

const props = defineProps<{
  modelValue: unknown
  filterCallback: () => void
  params: {
    values: (string | number)[]
    cellRenderer?: Component | ((params: unknown) => string)
    cellRendererParams?: Record<string, unknown>
    targetFilterType?: string
  }
}>()

const emit = defineEmits(['update:modelValue'])

const filterType = props.params.targetFilterType || 'set'

const uniqueValues = computed(() => {
  const raw = props.params.values || []

  return Array.from(new Set(raw))
})

const getDefaultModel = (): SetFilterModel => ({
  filterType,
  includeEmpty: true,
  filter: [...(uniqueValues.value || [])],
})

const localFilter = computed({
  get: () => {
    return (props.modelValue as any) || getDefaultModel()
  },
  set: (val: any) => {
    emit('update:modelValue', val)
  },
})

const searchQuery = ref('')

const normalize = (val: string | number) =>
  String(val)
    .normalize('NFD')
    .replace(/[\u0300-\u036F]/g, '')
    .toLowerCase()

const filteredValues = computed(() => {
  if (!searchQuery.value) {
    return uniqueValues.value || []
  }

  const query = normalize(searchQuery.value)

  return uniqueValues.value.filter(
    (val) => normalize(String(val)).includes(query),
  )
})

const isAllVisibleSelected = computed(() => {
  if (filteredValues.value.length === 0) {
    return false
  }
  return filteredValues.value.every((val) => localFilter.value.filter.includes(val))
})

const isSomeVisibleSelected = computed(() => {
  if (filteredValues.value.length === 0) {
    return false
  }
  const count = filteredValues.value.filter(
    (val) => localFilter.value.filter.includes(val),
  ).length
  return count > 0 && count < filteredValues.value.length
})

const applyChange = () => {
  const newVal = JSON.parse(JSON.stringify(localFilter.value))
  emit('update:modelValue', newVal)
  props.filterCallback()
}

const updateFilter = (checked: boolean, value: string | number) => {
  const currentFilter = { ...localFilter.value }

  currentFilter.filterType = filterType

  if (checked) {
    currentFilter.filter = [...currentFilter.filter, value]
  } else {
    currentFilter.filter = currentFilter.filter.filter((v: string | number) => v !== value)
  }

  localFilter.value = currentFilter
  props.filterCallback()
}

const toggleSelectAll = (checked: boolean) => {
  const currentSet = new Set(localFilter.value.filter)

  if (checked) {
    filteredValues.value.forEach((v) => currentSet.add(v))
  } else {
    filteredValues.value.forEach((v) => currentSet.delete(v))
  }

  localFilter.value.filter = Array.from(currentSet)
  applyChange()
}

const toggleIncludeEmpty = (checked: boolean) => {
  const currentFilter = { ...localFilter.value }
  currentFilter.includeEmpty = checked
  localFilter.value = currentFilter
  props.filterCallback()
}

const isComponentRenderer = computed(() => {
  const renderer = props.params.cellRenderer
  return renderer && typeof renderer !== 'function'
})

const getRendererParams = (value: string | number) => {
  const extraParams = props.params.cellRendererParams || {}
  return {
    value,
    ...extraParams,
  }
}

const getFormattedValue = (value: string | number) => {
  if (typeof props.params.cellRenderer === 'function') {
    const renderer = props.params.cellRenderer as (params: unknown) => string
    return renderer({ value })
  }
  return value
}
</script>

<template>
  <div class="flex flex-col m-2 min-w-[250px] gap-2">
    <div class="mb-1">
      <DsfrInput
        v-model="searchQuery"
        placeholder="Rechercher..."
        type="search"
        class="w-full"
        small
      />
    </div>

    <div class="border-b flex flex-col gap-1">
      <DsfrCheckbox
        :model-value="isAllVisibleSelected"
        :indeterminate="isSomeVisibleSelected"
        label="Tout sélectionner"
        small
        :value="undefined"
        name="select-all"
        @update:model-value="toggleSelectAll($event)"
      />

      <DsfrCheckbox
        v-if="!['set', 'boolean'].includes(localFilter.filterType)"
        v-model="localFilter.includeEmpty"
        :disabled="!localFilter.filter.length"
        :checked="localFilter.includeEmpty || !localFilter.filter.length"
        label="Aucune"
        small
        :value="undefined"
        name="Aucune"
        @update:model-value="toggleIncludeEmpty($event)"
      />
    </div>

    <div class="max-h-60 overflow-y-auto pr-1 filter-list">
      <div
        v-for="value in filteredValues"
        :key="String(value)"
        class="mb-1"
      >
        <DsfrCheckbox
          :model-value="localFilter.filter.includes(value)"
          small
          :name="String(value)"
          :value="value"
          @update:model-value="updateFilter($event, value)"
        >
          <template #label>
            <component
              :is="params.cellRenderer"
              v-if="isComponentRenderer"
              :params="getRendererParams(value)"
            />
            <span v-else>{{ getFormattedValue(value) }}</span>
          </template>
        </DsfrCheckbox>
      </div>
      <div v-if="filteredValues.length === 0" class="text-sm text-gray-500 italic text-center py-2">
        Aucun résultat.
      </div>
    </div>
  </div>
</template>

<style>
.filter-list::-webkit-scrollbar {
  width: 6px;
}
.filter-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.filter-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}
.filter-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

:deep(.fr-checkbox-group) {
  margin-bottom: 0 !important;
}
</style>
