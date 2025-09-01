<script lang="ts" setup>
import type { SelectionChangedEvent } from 'ag-grid-community'

import { listOfVerbosePrefecture } from '@biblio-num/shared'
import type { IPaginationUser } from '@biblio-num/shared'

import { dateToStringFr } from '@/utils'
import { useUserStore } from '@/stores'
import type { BNColDef } from '@/components/ag-grid/server-side/bn-col-def.interface'
import AgGridServerSide from '@/components/ag-grid/server-side/AgGridServerSide.vue'
import { baseColDef } from '@/components/ag-grid/server-side/columndef-base'
import RoleBadgesRenderer from '@/components/Badges/role/RoleBadgesRenderer.vue'
import { useActiveFilter } from '@/components/ag-grid/active-filters/useActiveFilter'

const agGridComponent = ref()
const router = useRouter()

const columnDefs: BNColDef[] = [
  {
    headerName: 'id',
    field: 'id',
    hide: true,
  },
  {
    headerName: 'Ver.',
    field: 'validated',
    width: 70,
    suppressMenu: true,
    cellRenderer: ({ value }: { value: boolean }) => (value ? '✅' : '❌'),
  },
  {
    ...baseColDef,
    headerName: 'Courriel',
    field: 'email',
    width: 250,
  },
  {
    ...baseColDef,
    headerName: 'Préfecture',
    field: 'prefecture',
    fieldType: 'enum',
    filter: 'agSetColumnFilter',
    filterParams: {
      values: listOfVerbosePrefecture,
      suppressMiniFilter: true,
    },
    width: 250,
  },
  {
    ...baseColDef,
    headerName: 'Nom de famille',
    field: 'lastname',
    width: 200,
  },
  {
    ...baseColDef,
    headerName: 'Prénom',
    field: 'firstname',
    width: 200,
  },
  {
    ...baseColDef,
    headerName: 'Intitulé de la fonction',
    field: 'job',
  },
  {
    ...baseColDef,
    headerName: 'Rôle',
    field: 'roleLabel',
    width: 200,
    sortable: false,
    cellRenderer: RoleBadgesRenderer,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: ['admin', 'superadmin', 'instructor', ''],
      cellRenderer: RoleBadgesRenderer,
      suppressMiniFilter: true,
    },
    suppressMenu: true,
  },
  {
    ...baseColDef,
    headerName: 'Options',
    field: 'roleOptionsResume',
    sortable: false,
    suppressMenu: true,
  },
  {
    ...baseColDef,
    headerName: 'Création',
    field: 'createdAt',
    filter: 'agDateColumnFilter',
    width: 150,
    valueFormatter: ({ value }: { value: string | number | Date }) => dateToStringFr(value),
  },
  {
    ...baseColDef,
    headerName: 'Modification',
    field: 'updatedAt',
    filter: 'agDateColumnFilter',
    width: 150,
    valueFormatter: ({ value }: { value: string | number | Date }) => dateToStringFr(value),
  },
]

const store = useUserStore()
const apiCall = async (params: IPaginationUser) => {
  return store.listUsers(params)
}

const onSelectionChanged = (event: SelectionChangedEvent) => {
  const id = event.api.getSelectedRows()?.[0]?.id
  if (id) {
    router.push({
      name: 'User',
      params: { id },
    })
  }
}

const { activeFilters, onFiltersUpdated, handleClearAllFilters, handleRemoveFilter } = useActiveFilter(agGridComponent)
</script>

<template>
  <div class="flex flex-col h-full">
    <div
      v-if="activeFilters.length > 0"
      class="py-2 px-4"
    >
      <ActiveFiltersDropdown
        :filters="activeFilters"
        :column-definitions="columnDefs"
        @request-remove-filter="handleRemoveFilter"
        @request-clear-all="handleClearAllFilters"
      />
    </div>

    <AgGridServerSide
      ref="agGridComponent"
      class="h-full"
      :column-defs="columnDefs"
      pre-condition
      :api-call="apiCall"
      :on-selection-changed="onSelectionChanged"
      local-storage-key="users"
      @filters-updated="onFiltersUpdated"
    />
  </div>
</template>
