<script lang="ts" setup>
import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-material.css'
import '@/ag-grid-dsfr.css'

import { useRoute, useRouter } from 'vue-router'
import { computed, onMounted, type Ref, ref, watch } from 'vue'
import { AgGridVue } from 'ag-grid-vue3'
import type { ColDef, ColumnMenuTab, GridApi, GridReadyEvent, IServerSideGetRowsParams, SortModelItem } from 'ag-grid-community'

import type { IDemarche, SearchDossierDto } from '@biblio-num/shared'

import { type FrontMappingColumn, useDemarcheStore, useUserStore } from '@/stores'
import { fromFieldTypeToAgGridFilter } from '@/views/demarches/demarche/dossiers/demarche-dossiers-utils'
import DemarcheDossierCellRenderer from '@/views/demarches/demarche/dossiers/DemarcheDossierCellRenderer.vue'
import { gridOptionFactory } from '@/views/demarches/demarche/dossiers/grid-option-factory'

const route = useRoute()
const router = useRouter()
const demarcheStore = useDemarcheStore()
const userStore = useUserStore()
const gridApi: Ref<GridApi | undefined> = ref()
const groupByDossier: Ref<boolean> = ref(false)
const demarche = computed<IDemarche>(() => demarcheStore.currentDemarche as IDemarche)
const demarcheConfiguration = computed<FrontMappingColumn[]>(() => demarcheStore.currentDemarchePlaneConfiguration)
const pageSize = 20

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
    keys.forEach((key) => {
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
    dto.columns = params.columnApi
      .getColumnState()
      .filter((state) => !state.hide)
      .map((state) => state.colId)
    dto.perPage = pageSize
    dto.page = params.request.startRow / pageSize + 1
    const response = await demarcheStore.searchCurrentDemarcheDossiers(groupByDossier.value, dto)
    params.success({ rowData: response.data, rowCount: response.total })
  } else {
    params.fail()
  }
}

const gridOptions = gridOptionFactory(getRows, pageSize)

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
        menuTabs: ['filterMenuTab'] as ColumnMenuTab[],
        cellRenderer: DemarcheDossierCellRenderer,
        cellRendererParams: { column },
      }
    }),
  ]
}

const refresh = () => {
  if (gridApi.value) {
    gridApi.value.refreshServerSideStore({ purge: true })
  }
}

onMounted(computeColumnsDef)
watch(demarche, computeColumnsDef)
watch(groupByDossier, refresh, { immediate: true })

const onGridReady = (event: GridReadyEvent) => {
  gridApi.value = event.api
}
</script>

<template>
  <div :style="{ paddingBottom: '2rem' }">
    <div class="flex no-label-on-toggle fr-pl-2w fr-pt-2w">
      <DsfrToggleSwitch
        v-model="groupByDossier"
        label="Grouper par dossier"
      />
    </div>
    <div
      v-if="demarche"
      class="ag-grid-wrapper"
    >
      <ag-grid-vue
        class="ag-theme-material"
        :column-defs="columnsDef"
        :grid-options="gridOptions"
        @grid-ready="onGridReady($event)"
      />
    </div>
  </div>
</template>

<style scoped>
:deep(.fr-toggle label::before) {
  content: "" !important;
}
:deep(.ag-paging-panel) {
  border-top: none !important;
}
</style>
