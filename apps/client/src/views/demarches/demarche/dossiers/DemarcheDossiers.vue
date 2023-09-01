<script lang="ts" setup>
import { useRoute, useRouter } from 'vue-router'
import { computed, type ComputedRef, watch, ref, type Ref } from 'vue'
import type { IDemarche } from '@biblio-num/shared'
import { SearchDossierDto } from '@biblio-num/shared'
import { type FrontMappingColumn, useDemarcheStore, useUserStore } from '@/stores'
import { AgGridVue } from 'ag-grid-vue3'
import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-alpine.css'
import { localeTextAgGrid } from '@/components/ag-grid/agGridOptions'
import { type ColDef } from 'ag-grid-community/dist/lib/entities/colDef'
import { type IServerSideGetRowsParams } from 'ag-grid-community/dist/lib/interfaces/iServerSideDatasource'
import { fromFieldTypeToAgGridFilter } from '@/views/demarches/demarche/dossiers/demarche-dossiers-utils'
import { GridApi, type GridReadyEvent } from 'ag-grid-community'
import DemarcheDossierCellRenderer from '@/views/demarches/demarche/dossiers/DemarcheDossierCellRenderer.vue'
import { SortModelItem } from 'ag-grid-community/dist/lib/sortController'

const route = useRoute()
const router = useRouter()
const demarcheStore = useDemarcheStore()
const userStore = useUserStore()
const gridApi: Ref<GridApi | undefined> = ref()
const groupByDossier: Ref<boolean> = ref(false)
const demarche = computed<IDemarche>(() => demarcheStore.currentDemarche as IDemarche)
const demarcheConfiguration = computed<FrontMappingColumn[]>(() => demarcheStore.currentDemarchePlaneConfiguration)
const sideBarOptions = {
  toolPanels: ['columns', 'filters'],
  SideBarDef: {
    hiddenByDefault: false,
  },
}
const pageSize = 5

const computeSort = (dto: SearchDossierDto, sortModel: SortModelItem[]) => {
  if (sortModel.length) {
    dto.sorts = sortModel.map((sort) => ({
      key: sort.colId,
      // TODO: correct server side if key = sort => 500
      order: sort.sort === 'asc' ? 'ASC' : 'DESC',
    }))
  }
}

const computeFilter = (dto: SearchDossierDto, filterModel: Record<string, any>) => {
  const keys = Object.keys(filterModel)
  if (keys.length) {
    dto.filters = {}
    keys.forEach(key => {
      if (!filterModel[key].condition1) {
        dto.filters[key] = {
          filterType: filterModel[key].filterType,
          condition1: {
            filter: filterModel[key].filter,
            type: filterModel[key].type,
          },
        }
      } else {
        dto.filters[key] = filterModel[key]
      }
    })
  } else {
    dto.filters = undefined
  }
}

const getRows = async (params: IServerSideGetRowsParams) => {
  if (demarche.value) {
    const dto: SearchDossierDto = {
      page: 1,
      perPage: pageSize,
      sorts: [],
      filters: undefined,
      columns: [],
    }
    computeSort(dto, params.request.sortModel)
    computeFilter(dto, params.request.filterModel)
    dto.columns = params.columnApi.getColumnState()
      .filter(state => !state.hide)
      .map(state => state.colId)
    console.log(params.request)
    dto.perPage = pageSize
    dto.page = params.request.startRow / pageSize + 1
    const response = await demarcheStore.searchCurrentDemarcheDossiers(groupByDossier.value, dto)
    params.success({ rowData: response.data, rowCount: response.total })
  } else {
    params.fail()
  }
}

const gridOptions = {
  domLayout: 'autoHeight',
  localeText: localeTextAgGrid,
  suppressMenuHide: true,
  rowModelType: 'serverSide',
  serverSideDatasource: { getRows },
  serverSideSortOnServer: true,
  serverSideFilterOnServer: true,
  pagination: true,
  paginationPageSize: pageSize,
  cacheBlockSize: pageSize,
}
const defaultColumnsDef = {
  sortable: true,
  filter: true,
  resizable: true,
}
const columnsDef: Ref<ColDef[] | undefined> = ref()

const computeColumnsDef = () => {
  columnsDef.value = [
    {
      headerName: 'N° dossier',
      field: 'dossierId',
      filter: 'agNumberColumnFilter',
      menuTabs: ['filterMenuTab'],
    },
    ...demarcheConfiguration.value.map((column: FrontMappingColumn) => {
      return {
        headerName: column.columnLabel,
        field: column.id,
        filter: fromFieldTypeToAgGridFilter(column.type),
        autoHeight: true,
        menuTabs: ['filterMenuTab'],
        cellRenderer: DemarcheDossierCellRenderer,
        cellRendererParams: { column },
      }
    }),
  ]
}

watch(demarche, computeColumnsDef)
watch(groupByDossier, () => {
  if (gridApi.value) {
    gridApi.value?.refreshServerSide()
  }
}, { immediate: true })

const onGridReady = (event: GridReadyEvent) => {
  gridApi.value = event.api
}
</script>

<template>
  <div :style="{ paddingBottom: '2rem' }">
    <div class="flex no-label-on-toggle">
      <DsfrToggleSwitch
        v-model="groupByDossier"
        label="Grouper par dossier"
      />
    </div>
    <div class="ag-grid-wrapper">
      <ag-grid-vue
        v-if="demarche"
        class="ag-theme-alpine"
        :column-defs="columnsDef"
        :default-col-def="defaultColumnsDef"
        :grid-options="gridOptions"
        :side-bar="sideBarOptions"
        @grid-ready="onGridReady($event)"
      />
    </div>
  </div>
</template>

<style scoped>
:deep(.fr-toggle label::before) {
  content: "" !important;
}
</style>
