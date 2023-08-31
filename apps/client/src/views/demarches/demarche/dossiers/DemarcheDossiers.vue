<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, type ComputedRef, ref, type Ref, watch } from 'vue'
import type { FieldSearchOutputDto, IDemarche } from '@biblio-num/shared'
import { DossierSearchOutputDto, MappingColumnWithoutChildren, SearchDossierDto, SortDto } from '@biblio-num/shared'
import { type FrontMappingColumn, useDemarcheStore, useUserStore } from '@/stores'
import { fromFieldTypeToAgGridFilter } from '@/views/demarches/demarche/dossiers/demarche-dossiers-utils'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { localeTextAgGrid } from '@/components/ag-grid/agGridOptions'
import { type ColDef } from 'ag-grid-community/dist/lib/entities/colDef'
import AgGridMultiValueCell from '@/components/ag-grid/AgGridMultiValueCell.vue'
import { GridApi, type GridOptions, type GridReadyEvent } from 'ag-grid-community'
import DemarcheDossiersPagination, { type IPagination } from '@/views/demarches/demarche/dossiers/DemarcheDossiersPagination.vue'
import { ColumnApi } from 'ag-grid-community/dist/lib/columns/columnApi'
import { type ColumnState } from 'ag-grid-community/dist/lib/columns/columnModel'

const route = useRoute()
const router = useRouter()
const demarcheStore = useDemarcheStore()
const userStore = useUserStore()
const demarche = computed<IDemarche>(() => demarcheStore.currentDemarche)
const demarcheConfiguration = computed<MappingColumnWithoutChildren[]>(() => demarcheStore.currentDemarchePlaneConfiguration)
const groupByDossier: Ref<boolean> = ref(false)
const result: Ref<DossierSearchOutputDto | FieldSearchOutputDto> = computed(() => demarcheStore.currentDemarcheDossiers)
const gridOptions: GridOptions = {
  domLayout: 'autoHeight',
  localeText: localeTextAgGrid,
  pagination: false,
  suppressMenuHide: true,
}
const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
}
const dossierSearchDto: ComputedRef<SearchDossierDto> = computed(() => ({
  page: Number(route.query.page),
  perPage: 10,
  sorts: [],
  // filters: [],
  columns: demarcheConfiguration.value.map((c) => c.id),
}))

const columnDefs: Ref<ColDef[]> = ref([])

const updateColumnDefs = () => {
  columnDefs.value = [
    {
      headerName: 'N° dossier',
      field: 'dossierId',
      filter: 'agNumberColumnFilter',
    },
    ...demarcheConfiguration.value.map((column: FrontMappingColumn) => {
      return {
        headerName: column.columnLabel,
        field: column.id,
        filter: fromFieldTypeToAgGridFilter(column.type),
        autoHeight: true,

        menuTabs: ['filterMenuTab'],
        cellRenderer:
          groupByDossier.value && column.isChild
            ? AgGridMultiValueCell
            : (params: { value: string }) => {
                if (column.type === 'date') {
                  return new Date(params.value).toLocaleDateString()
                }
                return params.value
              },
      }
    }),
  ]
}
const gridApi: Ref<GridApi> = ref()
const columnApi: Ref<ColumnApi> = ref()

const refresh = async (firstTime = false) => {
  console.log('coucou')
  gridApi.value.showLoadingOverlay()
  if (!firstTime) {
    dossierSearchDto.value.sorts = []
    dossierSearchDto.value.columns = []
  }
  columnApi.value.getColumnState().forEach((state: ColumnState) => {
    if (!state.hide) {
      dossierSearchDto.value.columns.push(state.colId)
    }
    if (state.sort) {
      dossierSearchDto.value.sorts.push({ key: state.colId, order: state.sort.toUpperCase() })
    }
  })
  await demarcheStore.searchCurrentDemarcheDossiers(groupByDossier.value, dossierSearchDto.value)
  updateColumnDefs()
  gridApi.value.hideOverlay()
}

const onGridReady = (event: GridReadyEvent) => {
  gridApi.value = event.api
  columnApi.value = event.columnApi
}

const paginationUpdated = (pagination: IPagination) => {
  dossierSearchDto.value.page = pagination.page
  dossierSearchDto.value.perPage = pagination.perPage
  refresh()
}

watch(demarche, refresh)
</script>

<template>
  <div :style="{ paddingBottom: '2rem' }">
    <div class="flex no-label-on-toggle">
      <DsfrToggleSwitch
        v-model="groupByDossier"
        label="Grouper par dossier"
        @update:model-value="refresh()"
      />
      <!--    <DemarcheDossiersFilters />-->
    </div>
    <div class="ag-grid-wrapper">
      <ag-grid-vue
        class="ag-theme-alpine"
        :column-defs="columnDefs"
        :default-col-def="defaultColDef"
        :row-data="result.data"
        :grid-options="gridOptions"
        :side-bar="{
          toolPanels: ['columns', 'filters'],
          SideBarDef: {
            hiddenByDefault: false,
          },
        }"
        @grid-ready="onGridReady($event)"
        @sort-changed="refresh()"
        @drag-stopped="refresh()"
        @column-visible="refresh()"
        @filter-changed="refresh()"
      />
    </div>
    <div class="flex justify-end fr-mt-2v">
      <DemarcheDossiersPagination
        :total="result.total"
        @pagination-updated="paginationUpdated($event)"
      />
    </div>
  </div>
</template>

<style scoped>
:deep(.fr-toggle label::before) {
  content: "" !important;
}
</style>
