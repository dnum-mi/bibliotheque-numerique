import type { DisplayActiveFilter } from '@/components/ag-grid/active-filters/activeFilters.type'

export const useDossierFiltersStore = defineStore('dossierFilters', () => {
  const activeFilters = ref<Record<string, DisplayActiveFilter[]>>({})

  return {
    activeFilters,
  }
})
