<script lang="ts" setup>
import type { SelectionChangedEvent } from 'ag-grid-community'

import type { IPagination, IOrganisme, INumbersFilterCondition, IPaginated } from '@biblio-num/shared'

import { EOrganismeIdType, useOrganismeStore } from '@/stores/organisme'
import LayoutList from '@/components/Layout/LayoutList.vue'
import AgGridServerSide from '@/components/ag-grid/server-side/AgGridServerSide.vue'
import { listOrganismeColumnDef } from '@/views/organismes/list/column-def.const'
import type { OrganismeIdType } from '@/stores'
import { routeNames } from '../../../router/route-names'
import { useConfigurationStore } from '../../../stores/configuration'
import { useActiveFilter } from '@/components/ag-grid/active-filters/useActiveFilter'
import { EMPTY_RESULT, isEmptySetFilter, isEmptyYearsFilter } from './utils'

const organismeStore = useOrganismeStore()
const bnConfigStore = useConfigurationStore()
const router = useRouter()

const apiCall = async (params: IPagination<IOrganisme>): Promise<IPaginated<IOrganisme>> => {
  const { filters } = params

  if (filters?.missingDeclarationYears) {
    const yearFilter = filters.missingDeclarationYears.condition1 as INumbersFilterCondition
    if (isEmptyYearsFilter(yearFilter)) {
      return EMPTY_RESULT
    }
  }

  if (filters?.type && isEmptySetFilter(filters.type)) {
    return EMPTY_RESULT
  }

  return organismeStore.loadOrganismes(params)
}

const onSelectionChanged = (event: SelectionChangedEvent) => {
  const selection = event.api.getSelectedRows()?.[0]
  const id = selection?.idRna || selection?.idRnf
  if (id) {
    const idType: OrganismeIdType = (selection?.idRna ? EOrganismeIdType.Rna : EOrganismeIdType.Rnf) satisfies OrganismeIdType
    router.push({
      name: routeNames.FICHE_ORGANISME,
      params: { id },
      query: { idType },
    })
  }
}

const agGridComponent = ref()
const paginationDto = ref()
const download = () => {
  return organismeStore.exportOrganismes(paginationDto.value)
}

const enableSiaf = computed(() => bnConfigStore.enableSiaf)
const toSearch = () => {
  router.push({
    name: routeNames.SEARCH_ORGANISMES,
  })
}

onMounted(async () => {
  await bnConfigStore.getEnableSiaf()
})

const { activeFilters, onFiltersUpdated, handleClearAllFilters, handleRemoveFilter } = useActiveFilter(agGridComponent)
</script>

<template>
  <LayoutList
    title="Liste des organismes"
    title-bg-color="var(--border-plain-grey)"
    title-icon="fr-icon-building-line"
  >
    <div class="flex flex-col h-full">
      <div class="flex gap-3 m-2">
        <DsfrButton
          v-if="enableSiaf"
          label="Recherche dans le référentiel (RAF)"
          icon="fr-icon-search-line"
          small
          @click="toSearch"
        />
        <DsfrButton
          label="Télécharger"
          icon="ri-file-download-fill"
          small
          @click="download"
        />
        <ActiveFiltersDropdown
          v-if="activeFilters.length > 0"
          :filters="activeFilters"
          :column-definitions="listOrganismeColumnDef"
          @request-remove-filter="handleRemoveFilter"
          @request-clear-all="handleClearAllFilters"
        />
      </div>
      <AgGridServerSide
        ref="agGridComponent"
        v-model:pagination-dto="paginationDto"
        class="h-full"
        :column-defs="listOrganismeColumnDef"
        :on-selection-changed="onSelectionChanged"
        pre-condition
        local-storage-key="agGrid.organismes.state"
        :api-call="apiCall"
        @filters-updated="onFiltersUpdated"
      />
    </div>
  </LayoutList>
</template>
