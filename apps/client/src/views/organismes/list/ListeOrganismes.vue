<script lang="ts" setup>
import { type SelectionChangedEvent } from 'ag-grid-community'

import type { IOrganisme, PaginationDto } from '@biblio-num/shared'

import { useOrganismeStore } from '@/stores/organisme'
import LayoutList from '@/components/Layout/LayoutList.vue'
import AgGridServerSide from '@/components/ag-grid/server-side/AgGridServerSide.vue'
import { listOrganismeColumnDef } from '@/views/organismes/list/column-def.const'

const pageSize = 20
const organismeStore = useOrganismeStore()
const router = useRouter()

const apiCall = async (params: PaginationDto<IOrganisme>) => {
  return organismeStore.loadOrganismes(params)
}

const onSelectionChanged = (event: SelectionChangedEvent) => {
  const id = event.api.getSelectedRows()?.[0]?.id
  if (id) {
    router.push({
      name: 'FicheOrganisme',
      params: { id },
      query: { idType: 'Id' },
    })
  }
}

const agGridComponent = ref()
</script>

<template>
  <LayoutList
    title="Recherche un organisme"
    title-bg-color="var(--border-plain-grey)"
    title-icon="fr-icon-search-line"
  >
    <div class="">
      <ag-grid-server-side
        ref="agGridComponent"
        :column-defs="listOrganismeColumnDef"
        :on-selection-changed="onSelectionChanged"
        pre-condition
        :api-call="apiCall"
      />
    </div>
  </LayoutList>
</template>
