<script lang="ts" setup>
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
    cellRenderer?: any
    targetFilterType?: string
  }
}>()

const emit = defineEmits(['update:modelValue'])

const filterType = props.params.targetFilterType || 'set'

const getDefaultModel = (): SetFilterModel => ({
  filterType,
  includeEmpty: true,
  filter: [...(props.params.values || [])],
})

const localFilter = computed({
  get: () => {
    return (props.modelValue as any) || getDefaultModel()
  },
  set: (val: any) => {
    emit('update:modelValue', val)
  },
})

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
      v-if="localFilter.filterType !== 'set'"
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
      v-for="value in params.values"
      :key="value"
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
            v-if="params.cellRenderer"
            :params="{ value }"
          />
          <span v-else>{{ value }}</span>
        </template>
      </DsfrCheckbox>
    </div>
  </div>
</template>
