import type { Ref } from 'vue'
import type { DisplayActiveFilter } from './activeFilters.type'

export interface ActiveFilterFunctions {
  clearAllFilters: () => void
  removeFilter: (colId: string) => void
}

export const useActiveFilter = (agGridComponent: Ref<ActiveFilterFunctions | null | undefined>) => {
  const activeFilters = ref<DisplayActiveFilter[]>([])

  const onFiltersUpdated = (filters: DisplayActiveFilter[]) => {
    activeFilters.value = filters
  }

  const handleClearAllFilters = () => {
    if (agGridComponent.value) {
      agGridComponent.value.clearAllFilters()
    }
  }

  const handleRemoveFilter = (colId: string) => {
    if (agGridComponent.value) {
      agGridComponent.value.removeFilter(colId)
    }
  }

  return {
    activeFilters,
    onFiltersUpdated,
    handleClearAllFilters,
    handleRemoveFilter,
  }
}
