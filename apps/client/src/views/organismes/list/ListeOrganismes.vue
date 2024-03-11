<script lang="ts" setup>
import type { SelectionChangedEvent } from 'ag-grid-community'

import type { IPagination, IOrganisme } from '@biblio-num/shared'

import { useOrganismeStore } from '@/stores/organisme'
import LayoutList from '@/components/Layout/LayoutList.vue'
import AgGridServerSide from '@/components/ag-grid/server-side/AgGridServerSide.vue'
import { listOrganismeColumnDef } from '@/views/organismes/list/column-def.const'

const organismeStore = useOrganismeStore()
const router = useRouter()

const apiCall = async (params: IPagination<IOrganisme>) => {
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
const paginationDto = ref()
const download = () => {
  return organismeStore.exportOrganismes(paginationDto.value)
}
</script>

<template>
  <LayoutList
    title="Recherche un organisme"
    title-bg-color="var(--border-plain-grey)"
    title-icon="fr-icon-search-line"
  >
    <div class="flex justify-end m-2">
      <DsfrButton
        label="Télécharger"
        icon="ri-file-download-fill"
        small
        @click="download"
      />
    </div>

    <div class="">
      <AgGridServerSide
        ref="agGridComponent"
        v-model:pagination-dto="paginationDto"
        :column-defs="listOrganismeColumnDef"
        :on-selection-changed="onSelectionChanged"
        pre-condition
        :api-call="apiCall"
      />
    </div>
  </LayoutList>
</template>
