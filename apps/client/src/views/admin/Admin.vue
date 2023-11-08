
<script lang="ts" setup>
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { ColDef, SelectionChangedEvent } from 'ag-grid-community'

import LayoutList from '@/components/Layout/LayoutList.vue'
import AgGridServerSide from '@/components/ag-grid/server-side/AgGridServerSide.vue'
import { useUserStore } from '@/stores'
import { baseColDef } from '@/components/ag-grid/server-side/columndef-base'
import RoleBadgesRenderer from '../../components/Badges/RoleBadgesRenderer.vue'
import { useRouter } from 'vue-router'
import { PaginationUserDto } from '@biblio-num/shared'
import { dateToStringFr } from '@/utils'
// const props = defineProps<{ }>()

const agGridComponent = ref()
const router = useRouter()

const columnDefs:Ref<ColDef[]> = ref([
  {
    headerName: 'id',
    field: 'id',
    hide: true,
  },
  {
    ...baseColDef,
    headerName: 'Courriel',
    field: 'email',
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
    headerName: 'Intitulé de poste',
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
    field: 'createAt',
    filter: 'agDateColumnFilter',
    valueFormatter: ({ value }) => dateToStringFr(value),
  },
  {
    ...baseColDef,
    headerName: 'Modification',
    field: 'updateAt',
    filter: 'agDateColumnFilter',
    valueFormatter: ({ value }) => dateToStringFr(value),
  },
])

const store = useUserStore()
const apiCall = async (params: PaginationUserDto) => {
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
  <LayoutList>
    <template #title>
      <div class="bn-list-search bn-list-admin">
        <span
          class="fr-p-1w"
        >
          <VIcon
            name="ri-user-settings-line"
            aria-hidden="true"
          />
        </span>
        <h6 class="bn-list-search bn-list-admin fr-m-0">
          Administration des permissions
        </h6>
      </div>
    </template>

    <ag-grid-server-side
      ref="agGridComponent"
      :column-defs="columnDefs"
      pre-condition
      :api-call="apiCall"
      :on-selection-changed="onSelectionChanged"
    />
  </LayoutList>
</template>
