<script lang="ts" setup>
import type {
  DynamicKeys,
  IPaginated,
  IPaginationSmallDemarche,
  ISmallDemarcheOutput,
} from '@biblio-num/shared'

import { useDemarcheStore } from '@/stores/demarche'
import { routeNames } from '@/router/route-names'
import LayoutList from '@/components/Layout/LayoutList.vue'
import { useUserStore } from '@/stores'
import { useActiveFilter } from '@/components/ag-grid/active-filters/useActiveFilter'
import { demarcheColumnDefs } from './columns-def.const'
import type { BNColDef } from '@/components/ag-grid/server-side/bn-col-def.interface'

const dataTableComponent = useTemplateRef('dataTableComponent')
const demarcheStore = useDemarcheStore()
const router = useRouter()
const userStore = useUserStore()
const paginationDto = ref()

const LOCAL_STORAGE_KEY = 'agGrid.demarches.state'

const apiCall = async (params: IPaginationSmallDemarche): Promise<IPaginated<ISmallDemarcheOutput>> => {
  return demarcheStore.loadDemarches(params)
}

onMounted(async () => {
  // await demarcheStore.getDemarches()
  await userStore.loadMyProfile()
})

const onRowClick = (event: { data: DynamicKeys; column?: BNColDef; field?: string }) => {
  const selection = event.data
  const id = selection?.id
  router.push({ name: routeNames.DEMARCHE_DOSSIERS, params: { demarcheId: id } })
}

const { activeFilters, onFiltersUpdated, handleClearAllFilters, handleRemoveFilter } = useActiveFilter('data-table', dataTableComponent)
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
      </div>

      <DataTableServerSide
        ref="dataTableComponent"
        v-model:pagination-dto="paginationDto"
        :column-defs="demarcheColumnDefs"
        pre-condition
        :local-storage-key="LOCAL_STORAGE_KEY"
        :api-call="apiCall"
        @row-click="onRowClick($event)"
        @filters-updated="onFiltersUpdated"
      />
    </div>
  </LayoutList>
</template>
