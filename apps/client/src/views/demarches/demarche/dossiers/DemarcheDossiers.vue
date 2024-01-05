<script lang="ts" setup>
import { ref, computed, watchEffect, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import type { GridOptions } from 'ag-grid-enterprise'
import type {
  ColumnApi,
  ColumnMenuTab,
  GridApi,
  GridReadyEvent,
  SelectionChangedEvent,
} from 'ag-grid-community'

import type {
  CreateCustomFilterDto,
  ICustomFilter,
  IDemarche, MappingColumn,
  PaginationDto,
  PatchCustomFilterDto,
} from '@biblio-num/shared'

import {
  type FrontMappingColumn,
  useCustomFilterStore,
  useDemarcheStore,
} from '@/stores'
import DemarcheDossierCellRenderer from '@/views/demarches/demarche/dossiers/DemarcheDossierCellRenderer.vue'
import { deepAlmostEqual, selectKeysInObject } from '@/utils/object'
import AgGridServerSide from '@/components/ag-grid/server-side/AgGridServerSide.vue'
import { backendFilterToAggFilter } from '@/components/ag-grid/server-side/pagination.utils'
import { getAgGridFilterFromFieldType } from '@/components/ag-grid/server-side/filters.utils'
import type { BNColDef } from '@/components/ag-grid/server-side/bn-col-def.interface'
import DemarcheDossiersDisplays, { type TotalsAllowed } from './DemarcheDossiersDisplays.vue'
import type { CustomFilterWithErrors } from '@/views/demarches/demarche/dossiers/custom-filter-with-errors.type'
import type { ICustomFilterWithError } from '@biblio-num/shared/types/interfaces/custom-filters/custom-filters.interface'

type DemarcheDossiersProps = {
  id: string
  customDisplayId?: string
}
const props = defineProps<DemarcheDossiersProps>()

const demarcheStore = useDemarcheStore()
const router = useRouter()
const route = useRoute()
const gridApi = ref<GridApi>()
const columnApi = ref<ColumnApi>()
const demarche = computed<IDemarche>(() => demarcheStore.currentDemarche as IDemarche)
const demarcheConfiguration = computed<FrontMappingColumn[]>(() => demarcheStore.currentDemarcheFlatConfiguration)
const demarcheConfigurationHash = computed<Record<string, MappingColumn>>(() => demarcheStore.currentDemarcheConfigurationHash)
const customFilterStore = useCustomFilterStore()
const customFilters = computed<ICustomFilter[]>(() => customFilterStore.customFilters as ICustomFilter[])
const customFiltersWithErrors = computed<CustomFilterWithErrors[]>(() => customFilters.value.map((cf) => ({
  ...cf,
  disabledColumns: Object.keys(cf.filters || {})
    .concat(cf.sorts?.map((s) => s.key) || [])
    .filter((key) => !demarcheConfigurationHash.value[key]),
})))
const selectedCustomFilter = ref<ICustomFilterWithError | null>(null)
const totalsAllowed = computed<TotalsAllowed[] | undefined>(
  () => demarcheConfiguration.value
    .filter(mapping => mapping.type === 'number' && mapping.id !== '96151176-4624-4706-b861-722d2e53545d')
    .map((mapping) => ({ id: mapping.id, columnLabel: mapping.columnLabel } as TotalsAllowed)),
)

const hasNoRepeatableField = computed(() => {
  return !demarcheStore.currentDemarche?.mappingColumns.some((m) => 'children' in m)
})

const groupByDossier = ref(hasNoRepeatableField.value)

watchEffect(() => {
  if (hasNoRepeatableField.value) {
    groupByDossier.value = true
  }
})

const paginationChanged = computed(() => {
  const keys = ['columns', 'filters', 'sorts']
  return !deepAlmostEqual(
    {
      ...selectKeysInObject(paginationDto.value, keys),
      groupByDossier: groupByDossier.value,
    },
    selectKeysInObject(selectedCustomFilter.value || {}, [...keys, 'groupByDossier']),
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

const columnsDef = ref<BNColDef[]>()

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
        ...getAgGridFilterFromFieldType(column.type, column.formatFunctionRef),
        autoHeight: true,
        menuTabs: ['filterMenuTab'] as ColumnMenuTab[],
        cellRenderer: DemarcheDossierCellRenderer,
        cellRendererParams: { column },
        // TODO: need to identify type of filter
        fieldType: column.type,
        sortable: column.formatFunctionRef !== 'file', // TODO use FormatFunctionRef.file
        suppressMenu: column.formatFunctionRef === 'file', // TODO use FormatFunctionRef.file
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

onMounted(async () => {
  computeColumnsDef()
  await customFilterStore.getCustomFiltersByDemarche(demarche.value.id)
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
    agGridComponent.value.refresh()
  }
}

const onGridReady = (event: GridReadyEvent) => {
  gridApi.value = event.api
  columnApi.value = event.columnApi
}

//#region Filter events
const customDisplayOperationSuccess = ref(true)
const createFilter = async ({ filterName = '', totals = '' }: { filterName?: string, totals?: string }) => {
  customDisplayOperationSuccess.value = false
  const createCustomFilterDto: CreateCustomFilterDto = {
    name: filterName,
    groupByDossier: groupByDossier.value,
    columns: paginationDto.value.columns,
    sorts: paginationDto.value.sorts,
    filters: paginationDto.value.filters || undefined,
  }

  if (totals) {
    createCustomFilterDto.totals = totals === 'Aucun total' ? [] : [totals]
  }
  try {
    const filterId = await customFilterStore.createCustomFilter(createCustomFilterDto, demarche.value.id)
    selectFilter(filterId)
    customDisplayOperationSuccess.value = true
  } catch (error) {
    import.meta.env.DEV && console.warn(error)
  }
}
const updateFilter = async () => {
  customDisplayOperationSuccess.value = false
  if (selectedCustomFilter.value) {
    selectedCustomFilter.value.groupByDossier = groupByDossier.value
    selectedCustomFilter.value.columns = paginationDto.value.columns
    selectedCustomFilter.value.sorts = paginationDto.value.sorts
    selectedCustomFilter.value.filters = paginationDto.value.filters || undefined
    try {
      const dto = { ...selectedCustomFilter.value, disabledColumns: undefined }
      await customFilterStore.updateCustomFilter(selectedCustomFilter.value.id, dto)
      selectedCustomFilter.value = customFiltersWithErrors.value.find((cf) => cf.id === selectedCustomFilter.value?.id) || null
      customDisplayOperationSuccess.value = true
    } catch (error) {
      import.meta.env.DEV && console.warn(error)
    }
  } else {
    throw new Error('Aucun affichage sélectionné, impossible de mettre à jour l’affichage personnalisé')
  }
}
const deleteFilter = async () => {
  customDisplayOperationSuccess.value = false
  if (selectedCustomFilter.value) {
    try {
      await customFilterStore.deleteCustomFilter(selectedCustomFilter.value?.id)
      selectedCustomFilter.value = null
      resetAggState()
      customDisplayOperationSuccess.value = true
    } catch (error) {
      import.meta.env.DEV && console.warn(error)
    }
    await customFilterStore.getCustomFiltersByDemarche(demarche.value.id)
  }
}

const updateFilterName = async ({ filterName = '', totals = '' }) => {
  customDisplayOperationSuccess.value = false
  if (selectedCustomFilter.value) {
    const dto: PatchCustomFilterDto = {
      name: filterName,
    }
    if (totals) {
      dto.totals = totals === 'Aucun total' ? [] : [totals]
    }
    dto.columns = paginationDto.value.columns
    try {
      await customFilterStore.updateCustomFilter(selectedCustomFilter.value.id, dto)
      selectedCustomFilter.value.name = filterName
      selectedCustomFilter.value.totals = dto.totals ?? null
      customDisplayOperationSuccess.value = false
    } catch (error) {
      import.meta.env.DEV && console.warn(error)
    }
  }
}

const addCurrentFilterToRoute = () => {
  const query: Record<string, string | number | undefined> = {
    ...route.query,
    customDisplayId: selectedCustomFilter.value?.id,
  }
  if (selectedCustomFilter.value == null) {
    delete query.customDisplayId
  }
  router.push({
    query,
  })
}

watch(() => props.customDisplayId, async (newDisplayId, oldDisplayId) => {
  if (newDisplayId === oldDisplayId) {
    return
  }
  selectFilter(newDisplayId ? Number(newDisplayId) : null)
})

const selectFilter = async (id: number | null) => {
  if (id === null) {
    selectedCustomFilter.value = null
    resetAggState()
    addCurrentFilterToRoute()
    return
  }
  if (customFilterStore.customFilters.length === 0) {
    await customFilterStore.getCustomFiltersByDemarche(demarche.value.id)
  }
  selectedCustomFilter.value = customFiltersWithErrors.value.find((cf) => cf.id === id) || null
  if (selectedCustomFilter.value) {
    groupByDossier.value = selectedCustomFilter.value?.groupByDossier
    paginationDto.value.columns = selectedCustomFilter.value?.columns
    paginationDto.value.sorts = selectedCustomFilter.value?.sorts || []
    paginationDto.value.filters = selectedCustomFilter.value?.filters || null
    updateAggState()
    addCurrentFilterToRoute()
  } else {
    throw new Error('Le filtre sélectionné n’existe pas')
  }
}
//#endregion

const download = () => {
  demarcheStore.exportCurrentDemarcheDossiers(groupByDossier.value, paginationDto.value)
}

const agGridComponent = ref()

const toggleView = useDebounceFn((isActive: boolean) => {
  groupByDossier.value = isActive
  agGridComponent.value?.refresh()
})

const paginationDto = ref()
watch(paginationDto, async (newValue, oldValue) => {
  if (!oldValue && newValue && route.query.customDisplayId) {
    selectFilter(Number(route.query.customDisplayId))
  }
})
const apiCall = (dto: PaginationDto<unknown>) => {
  return demarcheStore.searchCurrentDemarcheDossiers(groupByDossier.value, dto)
}
</script>

<template>
  <div :style="{ paddingBottom: '2rem' }">
    <div class="flex justify-end m-2">
      <DsfrButton
        :label="'Télécharger'"
        icon="ri-file-download-fill"
        small
        @click="download"
      />
    </div>

    <div
      class="flex justify-between no-label-on-toggle items-center fr-pl-2w"
    >
      <div class="flex gap-2">
        <div
          v-if="!hasNoRepeatableField"
        >
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
            :disabled="hasNoRepeatableField"
            @click="toggleView(true)"
          >
            <VIcon :name="groupByDossier ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'" />
            Vue par dossier
          </DsfrButton>
        </div>
      </div>
      <DemarcheDossiersDisplays
        :displays="customFiltersWithErrors as ICustomFilterWithError[]"
        :selected-display="selectedCustomFilter as ICustomFilterWithError"
        :pagination-changed="paginationChanged"
        :totals-allowed="totalsAllowed"
        :operation-success="customDisplayOperationSuccess"
        @create-display="createFilter($event)"
        @update-display="updateFilter()"
        @update-display-name="updateFilterName($event)"
        @delete-display="deleteFilter()"
        @select-display="selectFilter($event)"
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
