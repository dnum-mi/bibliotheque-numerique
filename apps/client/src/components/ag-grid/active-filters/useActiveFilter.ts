import type { Ref } from 'vue'
import type { DisplayActiveFilter } from './activeFilters.type'
import { useDossierFiltersStore } from '@/stores/filtres'

export interface ActiveFilterFunctions {
  refresh: () => void
  clearAllFilters: () => void
  removeFilter: (colId: string) => void
}

export const useActiveFilter = (id: string, dataTable: Ref<ActiveFilterFunctions | null | undefined>) => {
  const dossierFilters = useDossierFiltersStore()
  const activeFilters = computed({
    get: () => dossierFilters.activeFilters[id] ?? (dossierFilters.activeFilters[id] = []),
    set: (filters: DisplayActiveFilter[]) => {
      dossierFilters.activeFilters[id] = filters
    },
  })

  const onFiltersUpdated = (filters: DisplayActiveFilter[]) => {
    activeFilters.value = filters
  }

  const handleClearAllFilters = () => {
    if (dataTable.value) {
      dataTable.value.clearAllFilters()
    }
  }

  const handleRemoveFilter = (colId: string) => {
    if (dataTable.value) {
      dataTable.value.removeFilter(colId)
    }
  }

  return {
    activeFilters,
    onFiltersUpdated,
    handleClearAllFilters,
    handleRemoveFilter,
  }
}
