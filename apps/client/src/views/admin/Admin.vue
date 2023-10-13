
<script lang="ts" setup>
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { ColDef, ValueFormatterParams, SelectionChangedEvent } from 'ag-grid-community'
import type { IUser, PaginationDto } from '@biblio-num/shared'

import LayoutList from '@/components/Layout/LayoutList.vue'
import AgGridServerSide from '@/components/ag-grid/server-side/AgGridServerSide.vue'
import { useUserStore } from '@/stores'
import { baseColDef } from '@/components/ag-grid/server-side/columndef-base'
import RoleBadgesRenderer from '../../components/Badges/RoleBadgesRenderer.vue'
import { useRoute, useRouter } from 'vue-router'
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
    width: 350,
  },
  {
    ...baseColDef,
    headerName: 'Rôle',
    field: 'role.label',
    width: 300,
    cellRenderer: RoleBadgesRenderer,
    filter: 'agSetColumnFilter',
    filterParams: {
      values: ['sudo', 'admin', 'superadmin', 'instructor', ''],
      cellRenderer: RoleBadgesRenderer,
      suppressMiniFilter: true,
    },
  },
  // TODO: A revoir par rapport au BACK-END
  {
    ...baseColDef,
    suppressMenu: true,
    headerName: 'Type',
    field: 'type',
    width: 450,
  },
  // TODO: A confirmer
  // {
  //   headerName: 'Création',
  //   field: 'createAt',
  // },
  // {
  //   headerName: 'Modification',
  //   field: 'updateAt',
  // },
])

const store = useUserStore()
const apiCall = async (params: PaginationDto<IUser>) => {
  return store.getUsersRole(params)
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
