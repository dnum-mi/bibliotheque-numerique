<script lang="ts" setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import type { GridOptions } from 'ag-grid-enterprise'
import type { ColumnMenuTab, GridApi, GridReadyEvent, SelectionChangedEvent } from 'ag-grid-community'

import type { ICreateCustomFilter, IPagination, IPatchCustomFilter, ICustomFilter, IDemarche, IMappingColumn } from '@biblio-num/shared'

import type { FrontIMappingColumn } from '@/stores'
import { useCustomFilterStore, useDemarcheStore } from '@/stores'
import DemarcheDossierCellRenderer from '@/views/demarches/demarche/dossiers/DemarcheDossierCellRenderer.vue'
import { deepAlmostEqual, selectKeysInObject } from '@/utils/object'
import { backendFilterToAggFilter } from '@/components/ag-grid/server-side/pagination.utils'
import { getAgGridFilterFromFieldType } from '@/components/ag-grid/server-side/filters.utils'
import type { BNColDef } from '@/components/ag-grid/server-side/bn-col-def.interface'
import DemarcheDossiersDisplays from './DemarcheDossiersDisplays.vue'
import type { TotalsAllowed } from './DemarcheDossiersDisplays.vue'
import type { CustomFilterWithErrors } from '@/views/demarches/demarche/dossiers/custom-filter-with-errors.type'
import { useActiveFilter } from '@/components/ag-grid/active-filters/useActiveFilter'
import { useTour } from '@/composables/use-tour'
import { filterTourSteps } from './TutoFilterDossier'

const demarcheStore = useDemarcheStore()
const router = useRouter()
const route = useRoute()
const gridApi = ref<GridApi>()
const agGridComponent = ref()
const demarche = computed<IDemarche>(() => demarcheStore.currentDemarche as IDemarche)
const demarcheConfiguration = computed<FrontIMappingColumn[]>(() => demarcheStore.currentDemarcheFlatConfiguration)
const demarcheConfigurationHash = computed<Record<string, IMappingColumn>>(() => demarcheStore.currentDemarcheConfigurationHash)
const customDisplayStore = useCustomFilterStore()
const customDisplay = computed<ICustomFilter[]>(() => customDisplayStore.customFilters as ICustomFilter[])
const customDisplayWithErrors = computed<CustomFilterWithErrors[]>(() =>
  (customDisplay.value || []).map((cf) => ({
    ...cf,
    disabledColumns: Object.keys(cf.filters || {})
      .concat(Array.isArray(cf.sorts) ? cf.sorts.map((s) => s.key) : [])
      .filter((key) => !demarcheConfigurationHash.value[key]),
  })),
)
const selectedCustomDisplay = ref<ICustomFilter | null>(null)
const totalsAllowed = computed<TotalsAllowed[] | undefined>(() =>
  demarcheConfiguration.value
    .filter((mapping) => mapping.type === 'number' && mapping.id !== '96151176-4624-4706-b861-722d2e53545d')
    .map((mapping) => ({ id: mapping.id, columnLabel: mapping.columnLabel }) as TotalsAllowed),
)

const { startTour } = useTour({
  tourId: 'dossier-display-filter-tour', // Clé unique pour ce tour
  steps: filterTourSteps,
})

const startTutorial = () => {
  startTour()
}

//#region 📍------ LOCAL STORAGE ------ 📍
const localStoragePaginationKey = computed(() => `agGrid.demarche-${route.params.demarcheId}.dossiers.pagination`)
const localStorageGroupByKey = computed(() => `agGrid.demarche-${route.params.demarcheId}.dossiers.groupBy`)
const localStorageDisplayIdKey = computed(() => `agGrid.demarche-${route.params.demarcheId}.dossiers.currentDisplayId`)
//#endregion

//#region 📍------ GROUP BY DOSSIER ------ 📍
const hasNoRepeatableField = computed(() => {
  return !demarcheStore.currentDemarche?.mappingColumns.some((m) => 'children' in m)
})
const groupByDossier = ref(hasNoRepeatableField.value)

const apiCall = (dto: IPagination<unknown>) => {
  return demarcheStore.searchCurrentDemarcheDossiers(groupByDossier.value, dto)
}

const toggleView = useDebounceFn((isActive: boolean) => {
  groupByDossier.value = isActive
  agGridComponent.value?.refresh()
})

watch(groupByDossier, (value) => {
  localStorage.setItem(localStorageGroupByKey.value, `${value}`)
})
//#endregion

const paginationDto = ref({} as IPagination<any>)

const paginationChanged = computed(() => {
  const keys = ['columns', 'filters', 'sorts']
  return !deepAlmostEqual(
    {
      ...selectKeysInObject(paginationDto.value, keys),
      groupByDossier: groupByDossier.value,
    },
    selectKeysInObject(selectedCustomDisplay.value || {}, [...keys, 'groupByDossier']),
  )
})

const fetching = computed(() => demarcheStore.fetching)

const specificGridOptions: GridOptions = {
  onDragStopped: () => {
    if (selectedCustomDisplay.value) {
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
    ...demarcheConfiguration.value.map((column: FrontIMappingColumn) => {
      return {
        headerName: column.columnLabel,
        field: column.id,
        ...getAgGridFilterFromFieldType(column.type, column.formatFunctionRef),
        autoHeight: true,
        menuTabs: ['filterMenuTab'] as ColumnMenuTab[],
        cellRenderer: DemarcheDossierCellRenderer,
        cellRendererParams: { column },
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

watch(demarche, async (newValue) => {
  computeColumnsDef()
  await customDisplayStore.getCustomFiltersByDemarche(newValue.id)
})

watch(fetching, () => {
  if (!fetching.value) {
    agGridComponent.value?.refresh()
  }
})

const resetAggState = () => {
  if (gridApi.value) {
    gridApi.value.setFilterModel({})
    gridApi.value.resetColumnState()
  }
}

const updateAggState = () => {
  if (gridApi.value) {
    gridApi.value.setFilterModel(backendFilterToAggFilter(paginationDto.value.filters || {}))
    const statesHash = Object.fromEntries(gridApi.value?.getColumnState().map((state) => [state.colId, state]))
    const sortHash = Object.fromEntries(paginationDto.value.sorts.map((sort) => [sort.key, sort]))
    gridApi.value?.applyColumnState({
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
}

//#region 📍------ CUSTOM DISPLAY ------ 📍
const customDisplayOperationSuccess = ref(true)

const updateDisplay = async () => {
  customDisplayOperationSuccess.value = false
  if (selectedCustomDisplay.value) {
    selectedCustomDisplay.value.groupByDossier = groupByDossier.value
    selectedCustomDisplay.value.columns = paginationDto.value.columns
    selectedCustomDisplay.value.sorts = paginationDto.value.sorts
    selectedCustomDisplay.value.filters = paginationDto.value.filters || undefined
    try {
      const dto = { ...selectedCustomDisplay.value, disabledColumns: undefined }
      dto.filters = dto.filters || null
      await customDisplayStore.updateCustomFilter(selectedCustomDisplay.value.id, dto)
      selectedCustomDisplay.value = customDisplayWithErrors.value.find((cf) => cf.id === selectedCustomDisplay.value?.id) || null
      customDisplayOperationSuccess.value = true
    } catch (error) {
      import.meta.env.DEV && console.warn(error)
    }
  } else {
    throw new Error('Aucun affichage sélectionné, impossible de mettre à jour l’affichage personnalisé')
  }
}

const deleteDisplay = async () => {
  customDisplayOperationSuccess.value = false
  if (selectedCustomDisplay.value) {
    try {
      await customDisplayStore.deleteCustomFilter(selectedCustomDisplay.value?.id)
      selectedCustomDisplay.value = null
      resetAggState()
      customDisplayOperationSuccess.value = true
    } catch (error) {
      import.meta.env.DEV && console.warn(error)
    }
    await customDisplayStore.getCustomFiltersByDemarche(demarche.value.id)
  }
}

const updateDisplayName = async ({ filterName = '', totals = [] }) => {
  customDisplayOperationSuccess.value = false
  if (selectedCustomDisplay.value) {
    const dto: IPatchCustomFilter = {
      name: filterName,
    }
    if (totals) {
      dto.totals = totals.filter((tt) => tt !== 'Aucun total')
    }
    dto.columns = paginationDto.value.columns
    try {
      await customDisplayStore.updateCustomFilter(selectedCustomDisplay.value.id, dto)
      selectedCustomDisplay.value.name = filterName
      selectedCustomDisplay.value.totals = dto.totals ?? null
      customDisplayOperationSuccess.value = false
    } catch (error) {
      import.meta.env.DEV && console.warn(error)
    }
  }
}

const selectDisplay = async (id: number | null) => {
  if (id === null) {
    selectedCustomDisplay.value = null
    resetAggState()
    localStorage.removeItem(localStorageGroupByKey.value)
    localStorage.removeItem(localStorageDisplayIdKey.value)
    groupByDossier.value = false
    return
  }
  if (customDisplayStore.customFilters.length === 0) {
    await customDisplayStore.getCustomFiltersByDemarche(demarche.value.id)
  }
  selectedCustomDisplay.value = customDisplayWithErrors.value.find((cf) => cf.id === id) || null
  if (selectedCustomDisplay.value) {
    groupByDossier.value = selectedCustomDisplay.value?.groupByDossier
    paginationDto.value.columns = selectedCustomDisplay.value?.columns
    paginationDto.value.sorts = selectedCustomDisplay.value?.sorts || []
    paginationDto.value.filters = selectedCustomDisplay.value?.filters || null
    updateAggState()
    localStorage.setItem(localStorageDisplayIdKey.value, `${selectedCustomDisplay.value.id}`)
  } else {
    throw new Error('Le filtre sélectionné n’existe pas')
  }
}

const createDisplay = async ({ filterName = '', totals = [] }: { filterName?: string; totals?: string[] }) => {
  customDisplayOperationSuccess.value = false
  const createCustomFilterDto: ICreateCustomFilter = {
    name: filterName,
    groupByDossier: groupByDossier.value,
    columns: paginationDto.value.columns,
    sorts: paginationDto.value.sorts,
    filters: paginationDto.value.filters || undefined,
  }

  if (totals) {
    createCustomFilterDto.totals = totals.filter((tt) => tt !== 'Aucun total')
  }
  try {
    const filterId = await customDisplayStore.createCustomFilter(createCustomFilterDto, demarche.value.id)
    selectDisplay(filterId)
    customDisplayOperationSuccess.value = true
  } catch (error) {
    import.meta.env.DEV && console.warn(error)
  }
}
//#endregion

const download = () => {
  demarcheStore.exportCurrentDemarcheDossiers(groupByDossier.value, paginationDto.value)
}

const readyToLoadAgGrid = ref<boolean>(false)

onMounted(async () => {
  computeColumnsDef()
  await customDisplayStore.getCustomFiltersByDemarche(demarche.value.id)
  if (localStorage.getItem(localStorageGroupByKey.value) === 'true') {
    groupByDossier.value = true
  }
  const displayIdKey = Number.parseInt(localStorage.getItem(localStorageDisplayIdKey.value) || '-1')
  if (displayIdKey > -1) {
    selectedCustomDisplay.value = customDisplayWithErrors.value.find((cf) => cf.id === displayIdKey) || null
  }
  readyToLoadAgGrid.value = true
})

const { activeFilters, onFiltersUpdated, handleRemoveFilter } = useActiveFilter(agGridComponent)

const customHandleClearAllFilters = async () => {
  if (selectedCustomDisplay.value && typeof selectedCustomDisplay.value.id === 'number') {
    await selectDisplay(selectedCustomDisplay.value.id)
  } else {
    resetAggState()
    paginationDto.value.filters = null
    paginationDto.value.sorts = []
  }
}

const clearAllFiltersButtonLabel = computed(() => {
  return selectedCustomDisplay.value ? 'Réinitialiser les filtres' : 'Tout supprimer'
})

const quickFilterValueTranslations: Record<string, string> = {
  TwentyFourHours: 'depuis 24 heures',
  ThreeDays: 'depuis 3 jours',
  OneWeek: 'depuis 1 semaine',
  TwoWeeks: 'depuis 2 semaines',
  OneMonth: 'depuis 1 mois',
  ThreeMonths: 'depuis 3 mois',
  SixMonths: 'depuis 6 mois',
  OneYear: 'depuis 1 an',
}
</script>

<template>
  <div class="bn-scroll-parent flex flex-col">
    <div class="flex flex-shrink-0 justify-between no-label-on-toggle items-center bn-dynamic-small-p">
      <div class="flex gap-2">
        <div v-if="!hasNoRepeatableField">
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
        <DsfrButton
          label="Télécharger"
          icon="ri-file-download-fill"
          class="fr-ml-5w"
          small
          @click="download"
        />
        <DsfrButton
          id="help-button"
          label="Lancer le tutoriel"
          icon="ri-question-mark"
          icon-only
          small
          primary
          @click="startTutorial"
        />
        <ActiveFiltersDropdown
          v-if="columnsDef"
          :filters="activeFilters"
          :column-definitions="columnsDef"
          :quick-filter-value-translations="quickFilterValueTranslations"
          :clear-all-button-label="clearAllFiltersButtonLabel"
          @request-remove-filter="handleRemoveFilter"
          @request-clear-all="customHandleClearAllFilters"
        />
      </div>
      <DemarcheDossiersDisplays
        :displays="customDisplayWithErrors as ICustomFilter[]"
        :selected-display="selectedCustomDisplay as ICustomFilter"
        :pagination-changed="paginationChanged"
        :totals-allowed="totalsAllowed"
        :operation-success="customDisplayOperationSuccess"
        @create-display="createDisplay($event)"
        @update-display="updateDisplay()"
        @update-display-name="updateDisplayName($event)"
        @delete-display="deleteDisplay()"
        @select-display="selectDisplay($event)"
      />
    </div>
    <div class="flex-grow">
      <AgGridServerSide
        v-if="demarche && columnsDef && readyToLoadAgGrid"
        ref="agGridComponent"
        v-model:pagination-dto="paginationDto"
        :column-defs="columnsDef"
        :loading="fetching"
        class="h-full"
        :pre-condition="!!demarche"
        :specific-grid-option="specificGridOptions"
        :on-selection-changed="onSelectionChanged"
        :api-call="apiCall"
        :local-storage-key="localStoragePaginationKey"
        @grid-ready="onGridReady($event)"
        @filters-updated="onFiltersUpdated"
      />
    </div>
  </div>
</template>

<style scoped>
:deep(.fr-toggle label::before) {
  content: '' !important;
}

:deep(.ag-paging-panel) {
  border-top: none !important;
}
</style>
