<script lang="ts" setup>
import type { IDemarche, ISmallDemarcheOutput } from '@biblio-num/shared'

import { dateToStringFr } from '@/utils'
import { useDemarcheStore } from '@/stores/demarche'
import { routeNames } from '@/router/route-names'
import OrganismeBadgesRenderer from '@/components/Badges/organisme/OrganismeBadgesRenderer.vue'
import BiblioNumDataTableAgGrid from '@/components/BiblioNumDataTableAgGrid.vue'
import LayoutList from '@/components/Layout/LayoutList.vue'
import { useUserStore } from '@/stores'
import { useActiveFilter } from '@/components/ag-grid/active-filters/useActiveFilter'

const agGridComponent = ref<InstanceType<typeof BiblioNumDataTableAgGrid> | null>(null)
const demarcheStore = useDemarcheStore()
const router = useRouter()
const headers = [
  {
    value: 'id',
    type: 'hidden',
    width: 0,
  },
  {
    text: 'N° Démarche DS',
    value: 'dsId',
    type: 'number',
    width: 200,
  },
  {
    text: 'Types',
    value: 'types',
    renderer: OrganismeBadgesRenderer,
    width: 200,
  },
  {
    text: 'Libellé de la démarche',
    value: 'title',
    type: 'text',
    width: 600,
  },
  {
    text: 'Créé le',
    value: 'dsCreatedAt',
    parseFn: dateToStringFr,
    type: 'date',
    width: 200,
  },
  {
    text: 'Publié le',
    value: 'dsPublishedAt',
    parseFn: dateToStringFr,
    type: 'date',
    width: 200,
  },
]
const userStore = useUserStore()
// Avoids the error: "AG Grid: cannot get grid to draw rows when it is in the middle of drawing rows."
const rowData = ref<ISmallDemarcheOutput[]>([])
watch(
  () => demarcheStore.demarches,
  () => {
    rowData.value = Array.isArray(demarcheStore.demarches) ? demarcheStore.demarches : []
  },
)

onMounted(async () => {
  await demarcheStore.getDemarches()
  await userStore.loadMyProfile()
})

const selectDemarche = (row: IDemarche[]) => {
  router.push({ name: routeNames.DEMARCHE_DOSSIERS, params: { demarcheId: row[0].id } })
}

const rowStyle = { cursor: 'pointer' }

const { activeFilters, onFiltersUpdated, handleClearAllFilters, handleRemoveFilter } = useActiveFilter(agGridComponent)
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
          :column-definitions="headers"
          @request-remove-filter="handleRemoveFilter"
          @request-clear-all="handleClearAllFilters"
        />
      </div>

      <BiblioNumDataTableAgGrid
        ref="agGridComponent"
        :headers="headers"
        action-title="Voir les détails de la démarche"
        :row-data="rowData"
        floating-filter
        row-selection="single"
        :row-style="rowStyle"
        @selection-changed="selectDemarche"
        @filters-updated="onFiltersUpdated"
      />
    </div>
  </LayoutList>
</template>
