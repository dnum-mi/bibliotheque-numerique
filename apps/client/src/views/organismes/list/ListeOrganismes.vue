<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import { useOrganismeStore } from '@/stores/organisme'
import LayoutList from '@/components/Layout/LayoutList.vue'
import AgGridServerSide from '@/components/ag-grid/server-side/AgGridServerSide.vue'
import { SelectionChangedEvent } from 'ag-grid-community'
import { listOrganismeColumnDef } from '@/views/organismes/list/column-def.const'
import type { IOrganisme, PaginationDto } from '@biblio-num/shared'

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
  <LayoutList>
    <template #title>
      <div class="bn-list-search bn-list-search-organisme">
        <span
          class="fr-icon-search-line fr-p-1w"
          aria-hidden="true"
        />
        <h6 class="bn-list-search-title-organisme fr-p-1w fr-m-0">
          Rechercher un organisme
        </h6>
      </div>
    </template>
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
