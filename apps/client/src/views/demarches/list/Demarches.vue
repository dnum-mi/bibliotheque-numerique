<script lang="ts" setup>
import type { IPaginated, IPaginationSmallDemarche, ISmallDemarcheOutput, IStringsFilterCondition } from '@biblio-num/shared'

import { useDemarcheStore } from '@/stores/demarche'
import { routeNames } from '@/router/route-names'
import type BiblioNumDataTableAgGrid from '@/components/BiblioNumDataTableAgGrid.vue'
import LayoutList from '@/components/Layout/LayoutList.vue'
import { useUserStore } from '@/stores'
import { useActiveFilter } from '@/components/ag-grid/active-filters/useActiveFilter'
import type { SelectionChangedEvent } from 'ag-grid-community'
import { demarcheColumnDefs } from './columns-def.const'
import { EMPTY_RESULT, isEmptyListFilter, isEmptySetFilter } from '@/components/ag-grid/utils'
import BiblioNumDataTable from '@/components/BiblioNumDataTable.vue'

const agGridComponent = ref<InstanceType<typeof BiblioNumDataTableAgGrid> | null>(null)
const demarcheStore = useDemarcheStore()
const router = useRouter()
const userStore = useUserStore()
const paginationDto = ref()

const apiCall = async (params: IPaginationSmallDemarche): Promise<IPaginated<ISmallDemarcheOutput>> => {
  const { filters } = params

  if (filters?.types) {
    const typeFilter = filters.types.condition1 as IStringsFilterCondition
    if (isEmptyListFilter(typeFilter)) {
      return EMPTY_RESULT
    }
  }

  if (filters?.types && isEmptySetFilter(filters.types)) {
    return EMPTY_RESULT
  }

  return demarcheStore.loadDemarches(params)
}

// Avoids the error: "AG Grid: cannot get grid to draw rows when it is in the middle of drawing rows."
const rowData = ref<ISmallDemarcheOutput[]>([])
watch(
  () => demarcheStore.demarches,
  () => {
    rowData.value = Array.isArray(demarcheStore.demarches) ? demarcheStore.demarches : []
  },
)

onMounted(async () => {
  // await demarcheStore.getDemarches()
  await userStore.loadMyProfile()
})

const onSelectDemarche = (event: SelectionChangedEvent) => {
  const selection = event.api.getSelectedRows()?.[0]
  const id = selection?.id
  router.push({ name: routeNames.DEMARCHE_DOSSIERS, params: { demarcheId: id } })
}

const { activeFilters, onFiltersUpdated, handleClearAllFilters, handleRemoveFilter } = useActiveFilter(agGridComponent)
const dataTable = ref('primevue')
</script>

<template>
  <LayoutList
    title="Liste des démarches"
    title-bg-color="var(--artwork-minor-blue-france)"
    title-icon="fr-icon-article-fill"
  >
    <div class="flex flex-col h-full">
      <div class="py-2 px-4">
        <ActiveFiltersDropdown
          v-if="activeFilters.length > 0"
          :filters="activeFilters"
          :column-definitions="demarcheColumnDefs"
          @request-remove-filter="handleRemoveFilter"
          @request-clear-all="handleClearAllFilters"
        />
        <DsfrSegmentedSet
          v-model="dataTable"
          :options="[
            {
              label: 'AgGrid',
              value: 'ag-grid',
            },
            {
              label: 'PrimeVue',
              value: 'primevue',
            },
          ]"
        />
      </div>
      <AgGridServerSide
        v-if="dataTable === 'ag-grid'"
        ref="agGridComponent"
        v-model:pagination-dto="paginationDto"
        class="h-full"
        :column-defs="demarcheColumnDefs"
        :on-selection-changed="onSelectDemarche"
        pre-condition
        local-storage-key="agGrid.demarches.state"
        :api-call="apiCall"
        @filters-updated="onFiltersUpdated"
      />
      <BiblioNumDataTable
        v-if="dataTable === 'primevue'"
        ref="agGridComponent"
        :headers="headers"
        action-title="Voir les détails de la démarche"
        :row-data="rowData"
        floating-filter
        row-selection="single"
        :row-style="rowStyle"
        @selection-changed="onSelectDemarche"
        @filters-updated="onFiltersUpdated"
      />
    </div>
  </LayoutList>
</template>
