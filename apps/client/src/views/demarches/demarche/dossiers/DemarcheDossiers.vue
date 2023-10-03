<script lang="ts" setup>
import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-material.css'
import '@/ag-grid-dsfr.css'

import { computed, type ComputedRef, reactive, type Ref, ref, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { AgGridVue } from 'ag-grid-vue3'
import type { GridOptions } from 'ag-grid-enterprise'
import type { ColumnApi, SelectionChangedEvent, ColDef, ColumnMenuTab, GridApi, GridReadyEvent, IServerSideGetRowsParams, SortModelItem } from 'ag-grid-community'
import type { CreateCustomFilterDto, FilterDto, ICustomFilter, IDemarche, SearchDossierDto, SortDto } from '@biblio-num/shared'

import { type FrontMappingColumn, useCustomFilterStore, useDemarcheStore } from '@/stores'
import {
  backendFilterToAggFilter,
  fromAggToBackendFilter,
  fromFieldTypeToAgGridFilter,
} from '@/views/demarches/demarche/dossiers/demarche-dossiers-utils'
import DemarcheDossiersFilters from '@/views/demarches/demarche/dossiers/DemarcheDossiersFilters.vue'
import DemarcheDossierCellRenderer from '@/views/demarches/demarche/dossiers/DemarcheDossierCellRenderer.vue'
import { gridOptionFactory } from '@/views/demarches/demarche/dossiers/grid-option-factory'
import { type SmallFilter } from './DemarcheDossiersFilters.vue'
import { deepAlmostEqual, selectKeysInObject } from '@/utils/object'

const demarcheStore = useDemarcheStore()
const router = useRouter()
const gridApi: Ref<GridApi | undefined> = ref()
const columnApi: Ref<ColumnApi | undefined> = ref()
const groupByDossier: Ref<boolean> = ref(false)
const demarche = computed<IDemarche>(() => demarcheStore.currentDemarche as IDemarche)
const demarcheConfiguration = computed<FrontMappingColumn[]>(() => demarcheStore.currentDemarchePlaneConfiguration)
const pageSize = 20
const customFilterStore = useCustomFilterStore()
const customFilters: ComputedRef<ICustomFilter[]> = computed(() => customFilterStore.customFilters)
const selectedCustomFilter: Ref<ICustomFilter | null> = ref(null)
const paginationDto: SearchDossierDto = reactive({
  page: 1,
  perPage: pageSize,
  sorts: [],
  filters: null,
  columns: [],
})

const paginationChanged = computed(() => {
  const keys = ['columns', 'filters', 'sorts']
  return !deepAlmostEqual(
    {
      ...selectKeysInObject(paginationDto, keys),
      groupByDossier: groupByDossier.value,
    },
    selectKeysInObject(selectedCustomFilter.value, [...keys, 'groupByDossier']),
  )
})

const fetching = computed(() => demarcheStore.fetching)

const computeSort = (sortModel: SortModelItem[]): SortDto[] => {
  return sortModel.map((sort) => ({
    key: sort.colId,
    order: sort.sort === 'asc' ? 'ASC' : 'DESC',
  }))
}

// function called by aggrid in SSR mode to fetch its data
const getRows = async (params: IServerSideGetRowsParams) => {
  if (fetching.value) return undefined
  if (demarche.value) {
    paginationDto.sorts = computeSort(params.request.sortModel)
    paginationDto.filters = fromAggToBackendFilter(params.request.filterModel)
    paginationDto.columns = params.columnApi
      .getColumnState()
      .filter((state) => !state.hide)
      .map((state) => state.colId)
    paginationDto.perPage = pageSize
    paginationDto.page = (params.request.startRow || 0) / pageSize + 1
    const response = await demarcheStore.searchCurrentDemarcheDossiers(groupByDossier.value, paginationDto)
    params.success({ rowData: response.data, rowCount: response.total })
  } else {
    params.fail()
  }
}

const gridOptions: GridOptions = {
  ...gridOptionFactory(getRows, pageSize),
  onDragStopped: () => {
    if (selectedCustomFilter.value) {
      refresh()
    }
  },
}

const columnsDef: Ref<ColDef[] | undefined> = ref()

const computeColumnsDef = () => {
  columnsDef.value = [
    {
      headerName: 'N° dossier',
      field: 'dossierId',
      hide: true,
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

const onSelectionChanged = ($event: SelectionChangedEvent) => {
  const id = $event.api.getSelectedRows()?.[0]?.dossierId
  if (id) {
    router.push({
      name: 'Dossiers',
      params: { id },
    })
  }
}

const refresh = () => {
  if (gridApi.value) {
    gridApi.value.refreshServerSideStore({ purge: true })
  }
}

const route = useRoute()

onMounted(async () => {
  computeColumnsDef()
  await customFilterStore.getCustomFilters()
  if (route.query.customFilter) {
    selectFilter(Number(route.query.customFilter))
  }
})
watch(demarche, async (newValue) => {
  computeColumnsDef()
  await customFilterStore.getCustomFiltersByDemarche(newValue.id)
})
watch(fetching, () => {
  if (!fetching.value) refresh()
})

const resetAggState = () => {
  if (gridApi.value && columnApi.value) {
    gridApi.value.setFilterModel({})
    columnApi.value?.resetColumnState()
  }
}

const updateAggState = () => {
  if (gridApi.value && columnApi.value) {
    gridApi.value.setFilterModel(backendFilterToAggFilter(paginationDto.filters || {}))
    const statesHash = Object.fromEntries(columnApi.value?.getColumnState().map((state) => [state.colId, state]))
    const sortHash = Object.fromEntries(paginationDto.sorts.map((sort) => [sort.key, sort]))
    columnApi.value?.applyColumnState({
      state: paginationDto.columns.map((c) => {
        const result = {
          ...statesHash[c],
          hide: false,
        }
        if (sortHash[c]) {
          result.sort = sortHash[c].order.toLowerCase() as 'asc' | 'desc'
        }
        return result
      }),
      applyOrder: true,
      defaultState: { hide: true },
    })
  }
}

const onGridReady = (event: GridReadyEvent) => {
  gridApi.value = event.api
  columnApi.value = event.columnApi
}

/* region Filter events */
const createFilter = async (filterName: string) => {
  const createCustomFilterDto: CreateCustomFilterDto = {
    name: filterName,
    groupByDossier: groupByDossier.value,
    columns: paginationDto.columns,
    sorts: paginationDto.sorts,
    filters: paginationDto.filters || undefined,
  }
  await customFilterStore.createCustomFilter(createCustomFilterDto, demarche.value.id)
  const filterId = customFilters.value.find((f) => f.name === filterName)?.id
  selectFilter(filterId)
}
const updateFilter = async (filter: SmallFilter) => {
  if (selectedCustomFilter.value) {
    selectedCustomFilter.value.groupByDossier = groupByDossier.value
    selectedCustomFilter.value.columns = paginationDto.columns
    selectedCustomFilter.value.sorts = paginationDto.sorts
    selectedCustomFilter.value.filters = paginationDto.filters || undefined
    await customFilterStore.updateCustomFilter(selectedCustomFilter.value.id, selectedCustomFilter.value)
  } else {
    throw new Error('There is not a selected custom filter')
  }
}
const deleteFilter = async () => {
  if (selectedCustomFilter.value) {
    await customFilterStore.deleteCustomFilter(selectedCustomFilter.value?.id)
    selectedCustomFilter.value = null
    resetAggState()
  }
}
const selectFilter = (id: number | null) => {
  if (id === null) {
    selectedCustomFilter.value = null
    resetAggState()
    return
  }
  selectedCustomFilter.value = customFilters.value.find((cf) => cf.id === id) || null
  if (selectedCustomFilter.value) {
    groupByDossier.value = selectedCustomFilter.value?.groupByDossier
    paginationDto.columns = selectedCustomFilter.value?.columns
    paginationDto.sorts = selectedCustomFilter.value?.sorts || []
    paginationDto.filters = selectedCustomFilter.value?.filters || null
    updateAggState()
  } else {
    throw new Error('Selected custom filter does not exist')
  }
}
const updateFilterName = async (name: string) => {
  if (selectedCustomFilter.value) {
    await customFilterStore.updateCustomFilter(selectedCustomFilter.value.id, { name })
    selectedCustomFilter.value.name = name
  }
}

/* endregion */

const download = () => {
  demarcheStore.exportCurrentDemarcheDossiers(groupByDossier.value, paginationDto)
}

const toggleView = useDebounceFn((isActive) => {
  groupByDossier.value = isActive
  refresh()
})
</script>

<template>
  <div :style="{ paddingBottom: '2rem' }">
    <div class="flex justify-between no-label-on-toggle items-center fr-pl-2w fr-pt-2w">
      <div
        class="flex  gap-2"
      >
        <div>
          <DsfrButton
            :tertiary="groupByDossier"
            :class="{ 'opacity-70': groupByDossier }"
            @click="toggleView(false)"
          >
            Vue par dossier <VIcon :name="!groupByDossier ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'" />
          </DsfrButton>
          <DsfrButton
            :tertiary="!groupByDossier"
            :class="{ 'opacity-70': !groupByDossier }"
            @click="toggleView(true)"
          >
            <VIcon :name="groupByDossier ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'" /> Vue par champ
          </DsfrButton>
        </div>
        <DsfrButton
          :label="'Télécharger'"
          icon="ri-file-download-fill"
          small
          @click="download"
        />
      </div>
      <DemarcheDossiersFilters
        :filters="customFilters as SmallFilter[]"
        :selected-filter="selectedCustomFilter as SmallFilter"
        :pagination-changed="paginationChanged"
        @create-filter="createFilter($event)"
        @update-filter="updateFilter($event)"
        @update-filter-name="updateFilterName($event)"
        @delete-filter="deleteFilter()"
        @select-filter="selectFilter($event)"
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
        :row-style="{ cursor: 'pointer' }"
        @grid-ready="onGridReady($event)"
        @column-visible="refresh()"
        @selection-changed="onSelectionChanged($event)"
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
