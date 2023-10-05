<script lang="ts" setup>
import 'ag-grid-enterprise'
import 'ag-grid-community/styles/ag-grid.css'
import 'ag-grid-community/styles/ag-theme-material.css'
import '@/ag-grid-dsfr.css'

import { computed, type ComputedRef, onMounted, ref, type Ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import type { GridOptions } from 'ag-grid-enterprise'
import type { ColDef, ColumnApi, ColumnMenuTab, GridApi, GridReadyEvent, SelectionChangedEvent } from 'ag-grid-community'
import type { CreateCustomFilterDto, ICustomFilter, IDemarche, PaginationDto } from '@biblio-num/shared'

import { type FrontMappingColumn, useCustomFilterStore, useDemarcheStore } from '@/stores'
import DemarcheDossiersFilters from '@/views/demarches/demarche/dossiers/DemarcheDossiersFilters.vue'
import DemarcheDossierCellRenderer from '@/views/demarches/demarche/dossiers/DemarcheDossierCellRenderer.vue'
import { type SmallFilter } from './DemarcheDossiersFilters.vue'
import { deepAlmostEqual, selectKeysInObject } from '@/utils/object'
import AgGridServerSide from '@/components/ag-grid/server-side/AgGridServerSide.vue'
import { backendFilterToAggFilter, fromFieldTypeToAgGridFilter } from '@/components/ag-grid/server-side/pagination.utils'

const demarcheStore = useDemarcheStore()
const router = useRouter()
const gridApi: Ref<GridApi | undefined> = ref()
const columnApi: Ref<ColumnApi | undefined> = ref()
const groupByDossier: Ref<boolean> = ref(false)
const demarche = computed<IDemarche>(() => demarcheStore.currentDemarche as IDemarche)
const demarcheConfiguration = computed<FrontMappingColumn[]>(() => demarcheStore.currentDemarchePlaneConfiguration)
const customFilterStore = useCustomFilterStore()
const customFilters: ComputedRef<ICustomFilter[]> = computed(() => customFilterStore.customFilters)
const selectedCustomFilter: Ref<ICustomFilter | null> = ref(null)

const paginationChanged = computed(() => {
  const keys = ['columns', 'filters', 'sorts']
  return !deepAlmostEqual(
    {
      ...selectKeysInObject(paginationDto.value, keys),
      groupByDossier: groupByDossier.value,
    },
    selectKeysInObject(selectedCustomFilter.value, [...keys, 'groupByDossier']),
  )
})

const fetching = computed(() => demarcheStore.fetching)

const specificGridOptions: GridOptions = {
  onDragStopped: () => {
    if (selectedCustomFilter.value) {
      agGridComponent.value.refresh()
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
  if (!fetching.value) agGridComponent.value?.refresh()
})

const resetAggState = () => {
  if (gridApi.value && columnApi.value) {
    gridApi.value.setFilterModel({})
    columnApi.value?.resetColumnState()
  }
}

const updateAggState = () => {
  if (gridApi.value && columnApi.value) {
    gridApi.value.setFilterModel(backendFilterToAggFilter(paginationDto.value.filters || {}))
    const statesHash = Object.fromEntries(columnApi.value?.getColumnState().map((state) => [state.colId, state]))
    const sortHash = Object.fromEntries(paginationDto.value.sorts.map((sort) => [sort.key, sort]))
    columnApi.value?.applyColumnState({
      state: paginationDto.value.columns.map((c) => {
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
    columns: paginationDto.value.columns,
    sorts: paginationDto.value.sorts,
    filters: paginationDto.value.filters || undefined,
  }
  await customFilterStore.createCustomFilter(createCustomFilterDto, demarche.value.id)
  const filterId = customFilters.value.find((f) => f.name === filterName)?.id || null
  selectFilter(filterId)
}
const updateFilter = async () => {
  if (selectedCustomFilter.value) {
    selectedCustomFilter.value.groupByDossier = groupByDossier.value
    selectedCustomFilter.value.columns = paginationDto.value.columns
    selectedCustomFilter.value.sorts = paginationDto.value.sorts
    selectedCustomFilter.value.filters = paginationDto.value.filters || undefined
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
    paginationDto.value.columns = selectedCustomFilter.value?.columns
    paginationDto.value.sorts = selectedCustomFilter.value?.sorts || []
    paginationDto.value.filters = selectedCustomFilter.value?.filters || null
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
  demarcheStore.exportCurrentDemarcheDossiers(groupByDossier.value, paginationDto.value)
}

const agGridComponent = ref()

const toggleView = useDebounceFn((isActive: boolean) => {
  groupByDossier.value = isActive
  agGridComponent.value?.refresh()
})

const paginationDto = ref()
const apiCall = (dto: PaginationDto<any>) => {
  return demarcheStore.searchCurrentDemarcheDossiers(groupByDossier.value, dto)
}
</script>

<template>
  <div :style="{ paddingBottom: '2rem' }">
    <div class="flex justify-between no-label-on-toggle items-center fr-pl-2w fr-pt-2w">
      <div class="flex gap-2">
        <div>
          <DsfrButton
            :tertiary="groupByDossier"
            :class="{ 'opacity-70': groupByDossier }"
            @click="toggleView(false)"
          >
            Vue par champ
            <VIcon :name="!groupByDossier ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'" />
          </DsfrButton>
          <DsfrButton
            :tertiary="!groupByDossier"
            :class="{ 'opacity-70': !groupByDossier }"
            @click="toggleView(true)"
          >
            <VIcon :name="groupByDossier ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'" />
            Vue par dossier
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
        @update-filter="updateFilter()"
        @update-filter-name="updateFilterName($event)"
        @delete-filter="deleteFilter()"
        @select-filter="selectFilter($event)"
      />
    </div>
    <div
      v-if="demarche && columnsDef"
      class="ag-grid-wrapper"
    >
      <ag-grid-server-side
        ref="agGridComponent"
        v-model:pagination-dto="paginationDto"
        :column-defs="columnsDef"
        :loading="fetching"
        :pre-condition="!!demarche"
        :specific-grid-option="specificGridOptions"
        :on-selection-changed="onSelectionChanged"
        :api-call="apiCall"
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
