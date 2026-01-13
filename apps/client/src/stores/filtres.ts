import type { DisplayActiveFilter } from '@/components/datatable/active-filters/activeFilters.type'

export const useDossierFiltersStore = defineStore('dossierFilters', () => {
  const activeFilters = ref<Record<string, DisplayActiveFilter[]>>({})

  return {
    activeFilters,
  }
})
