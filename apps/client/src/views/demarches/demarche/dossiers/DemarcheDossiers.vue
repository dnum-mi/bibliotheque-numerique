<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, ComputedRef, onMounted } from 'vue'
import type { FieldSearchOutputDto, IDemarche } from '@biblio-num/shared'
import { useDemarcheStore, useUserStore } from '@/stores'
import { MappingColumnWithoutChildren, SearchDossierDto } from '@biblio-num/shared'
import { fromFieldTypeToAgGridFilter } from '@/views/demarches/demarche/dossiers/demarche-dossiers-utils'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { localeTextAgGrid } from '@/components/ag-grid/agGridOptions'
import { ColDef } from 'ag-grid-community/dist/lib/entities/colDef'

const route = useRoute()
const router = useRouter()
const demarcheStore = useDemarcheStore()
const userStore = useUserStore()

const demarche = computed<IDemarche>(() => demarcheStore.currentDemarche)
const demarcheConfiguration = computed<MappingColumnWithoutChildren[]>(() => demarcheStore.currentDemarchePlaneConfiguration)
// const demarcheDossiers = computed<DossierSearchOutputDto>(() => demarcheStore.currentDemarcheDossiers || [])
const demarcheFields = computed<FieldSearchOutputDto>(() => demarcheStore.currentDemarcheFields)
const gridOptions = {
  pagination: true,
  domLayout: 'autoHeight',
  localeText: localeTextAgGrid,
}
const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
}
const dossierSearchDto: ComputedRef<SearchDossierDto> = computed(() => ({
  page: 1,
  perPage: 5,
  // sorts: [],
  // filters: [],
  columns: demarcheConfiguration.value.map((c) => c.id),
}))

const columnDefs: ComputedRef<ColDef[]> = computed(() => {
  return [
    {
      headerName: 'N° dossier',
      field: 'dossierId',
      filter: 'agNumberColumnFilter',
    },
    ...demarcheConfiguration.value.map((column: MappingColumnWithoutChildren) => {
      return {
        headerName: column.columnLabel,
        field: column.id,
        filter: fromFieldTypeToAgGridFilter(column.type),
        cellRenderer: (params: { value: string }) => {
          if (column.type === 'date') {
            return new Date(params.value).toLocaleDateString()
          }
          return params.value
        },
      }
    }),
  ]
})

onMounted(async () => {
  if (route.params.id) {
    await demarcheStore.getDemarche(route.params.id)
    await demarcheStore.searchCurrentDemarcheFields(dossierSearchDto.value)
  } else {
    router.push({ name: '404' })
  }
})
</script>

<template>
  <div :style="{ paddingBottom: '2rem' }">
    <!--    <DemarcheDossiersFilters />-->
    <div class="ag-grid-wrapper">
      <ag-grid-vue
        class="ag-theme-alpine"
        :column-defs="columnDefs"
        :default-col-def="defaultColDef"
        :row-data="demarcheFields.data"
        :grid-options="gridOptions"
      />
    </div>
  </div>
</template>

<style scoped></style>
