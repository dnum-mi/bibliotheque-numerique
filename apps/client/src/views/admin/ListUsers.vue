
<script lang="ts" setup>
import type { SelectionChangedEvent } from 'ag-grid-community'

import type { IPaginationUser } from '@biblio-num/shared-utils'

import { dateToStringFr } from '@/utils'
import { useUserStore } from '@/stores'
import type { BNColDef } from '@/components/ag-grid/server-side/bn-col-def.interface'
import AgGridServerSide from '@/components/ag-grid/server-side/AgGridServerSide.vue'
import { baseColDef } from '@/components/ag-grid/server-side/columndef-base'
import RoleBadgesRenderer from '@/components/Badges/RoleBadgesRenderer.vue'
// const props = defineProps<{ }>()

const agGridComponent = ref()
const router = useRouter()

const columnDefs = ref<BNColDef[]>([
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
    cellRenderer: ({ value }) => (value ? '✅' : '❌'),
  },
  {
    ...baseColDef,
    headerName: 'Courriel',
    field: 'email',
    width: 200,
  },
  {
    ...baseColDef,
    headerName: 'Prénom',
    field: 'firstname',
    width: 150,
  },
  {
    ...baseColDef,
    headerName: 'Nom de famille',
    field: 'lastname',
    width: 150,
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
    width: 300,
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
    valueFormatter: ({ value }) => dateToStringFr(value),
  },
  {
    ...baseColDef,
    headerName: 'Modification',
    field: 'updatedAt',
    filter: 'agDateColumnFilter',
    valueFormatter: ({ value }) => dateToStringFr(value),
  },
])

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
</script>

<template>
  <ag-grid-server-side
    ref="agGridComponent"
    :column-defs="columnDefs"
    pre-condition
    :api-call="apiCall"
    :on-selection-changed="onSelectionChanged"
  />
</template>
