<script lang="ts" setup>
import type {
  ICreateCustomFilter,
  IPagination,
  IPatchCustomFilter,
  ICustomFilter,
  IDemarche,
  IMappingColumn,
} from '@biblio-num/shared'
import type { FrontIMappingColumn } from '@/stores'
import type { BNColDef } from '@/components/ag-grid/server-side/bn-col-def.interface'
import type { TotalsAllowed } from './DemarcheDossiersDisplays.vue'
import type { CustomFilterWithErrors } from '@/views/demarches/demarche/dossiers/custom-filter-with-errors.type'

import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'

import { useCustomFilterStore, useDemarcheStore } from '@/stores'
import DemarcheDossierCellRenderer from '@/views/demarches/demarche/dossiers/DemarcheDossierCellRenderer.vue'
import { deepAlmostEqual, selectKeysInObject } from '@/utils/object'
import { getAgGridFilterFromFieldType } from '@/components/ag-grid/server-side/filters.utils'
import DemarcheDossiersDisplays from './DemarcheDossiersDisplays.vue'
import { useActiveFilter } from '@/components/ag-grid/active-filters/useActiveFilter'
import { useTour } from '@/composables/use-tour'
import { filterTourSteps } from './TutoFilterDossier'

const demarcheStore = useDemarcheStore()
const router = useRouter()
const route = useRoute()
const dataTableComponent = useTemplateRef('dataTableComponent')
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

//#region 📍------ LOCAL STORAGE ------ 📍
const localStorageDataTablePaginationKey = computed(() => `dataTable.demarche-${route.params.demarcheId}.dossiers.pagination`)
const localStorageGroupByKey = computed(() => `dataTable.demarche-${route.params.demarcheId}.dossiers.groupBy`)
const localStorageDisplayIdKey = computed(() => `dataTable.demarche-${route.params.demarcheId}.dossiers.currentDisplayId`)
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
  dataTableComponent.value?.refresh()
})

watch(groupByDossier, (value) => {
  localStorage.setItem(localStorageGroupByKey.value, `${value}`)
})
//#endregion

const paginationDto = ref({} as IPagination<any>)

const paginationChanged = computed(() => {
  // Ne pas calculer si paginationDto n'est pas encore initialisé ou si on n'a pas d'affichage sélectionné
  if (!paginationDto.value.columns || !selectedCustomDisplay.value) {
    return false
  }

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

const columnsDef = ref<BNColDef[]>()

export type ColumnMenuTab = 'filterMenuTab' | 'generalMenuTab' | 'columnsMenuTab'

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
        cellRenderer: markRaw(DemarcheDossierCellRenderer),
        cellRendererParams: { column },
        fieldType: column.type,
        sortable: column.formatFunctionRef !== 'file', // TODO use FormatFunctionRef.file
        suppressHeaderMenuButton: column.formatFunctionRef === 'file', // TODO use FormatFunctionRef.file
      }
    }),
  ]
}

const onSelectionChanged = ({ data: { dossierId: id }}: { data: { dossierId: number } }) => {
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
    dataTableComponent.value?.refresh()
  }
})

const resetDataTableState = () => {
  if (dataTableComponent.value) {
    dataTableComponent.value.clearAllFilters()
  }
}

const updateDataTableState = (selectedDisplay?: IPagination<any>) => {
  if (dataTableComponent.value) {
    dataTableComponent.value.updateDataTableState(selectedDisplay ?? paginationDto.value)
  }
}

//#region 📍------ CUSTOM DISPLAY ------ 📍
const customDisplayOperationSuccess = ref(true)

const updateDisplay = async () => {
  customDisplayOperationSuccess.value = false
  if (selectedCustomDisplay.value) {
    selectedCustomDisplay.value.groupByDossier = groupByDossier.value
    selectedCustomDisplay.value.columns = paginationDto.value.columns
    selectedCustomDisplay.value.sorts = paginationDto.value.sorts
    selectedCustomDisplay.value.filters = paginationDto.value.filters
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
      resetDataTableState()
      customDisplayOperationSuccess.value = true
    } catch (error) {
      import.meta.env.DEV && console.warn(error)
    }
    await customDisplayStore.getCustomFiltersByDemarche(demarche.value.id)
  }
}

const updateDisplayName = async ({ filterName = '', totals = [] }: { filterName?: string; totals?: string[] }) => {
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
    resetDataTableState()
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
    updateDataTableState()
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
    filters: paginationDto.value.filters,
    totals: [],
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

const readyToLoadDataTable = ref<boolean>(false)
const initialDataTableState = ref<IPagination<any> | null>(null)

onMounted(async () => {
  computeColumnsDef()
  await customDisplayStore.getCustomFiltersByDemarche(demarche.value.id)

  // Restaurer groupByDossier en premier
  if (localStorage.getItem(localStorageGroupByKey.value) === 'true') {
    groupByDossier.value = true
  }

  const displayIdKey = Number.parseInt(localStorage.getItem(localStorageDisplayIdKey.value) || '-1')
  if (displayIdKey > -1) {
    selectedCustomDisplay.value = customDisplayWithErrors.value.find((cf) => cf.id === displayIdKey) || null

    // Préparer la configuration initiale pour DataTableServerSide
    if (selectedCustomDisplay.value) {
      groupByDossier.value = selectedCustomDisplay.value.groupByDossier
      paginationDto.value.columns = selectedCustomDisplay.value.columns
      paginationDto.value.sorts = selectedCustomDisplay.value.sorts || []
      paginationDto.value.filters = selectedCustomDisplay.value.filters || null

      // Pour DataTable, vérifier d'abord s'il y a des données dans son localStorage
      const dataTableSavedData = localStorage.getItem(localStorageDataTablePaginationKey.value)
      if (dataTableSavedData) {
        try {
          initialDataTableState.value = JSON.parse(dataTableSavedData)
        } catch (e) {
          console.warn('Erreur de lecture du localStorage DataTable', e)
          // Fallback sur selectedCustomDisplay si erreur de parsing
          initialDataTableState.value = {
            page: 1,
            perPage: 20,
            columns: selectedCustomDisplay.value.columns,
            sorts: selectedCustomDisplay.value.sorts || [],
            filters: selectedCustomDisplay.value.filters || null,
          }
        }
      } else {
        // Pas de données DataTable sauvegardées, utiliser selectedCustomDisplay
        initialDataTableState.value = {
          page: 1,
          perPage: 20,
          columns: selectedCustomDisplay.value.columns,
          sorts: selectedCustomDisplay.value.sorts || [],
          filters: selectedCustomDisplay.value.filters || null,
        }
      }
    }
  } else {
    // Pas de custom display, mais vérifier quand même le localStorage DataTable
    const dataTableSavedData = localStorage.getItem(localStorageDataTablePaginationKey.value)
    if (dataTableSavedData) {
      try {
        initialDataTableState.value = JSON.parse(dataTableSavedData)
      } catch (e) {
        console.warn('Erreur de lecture du localStorage DataTable', e)
        initialDataTableState.value = null
      }
    }
  }

  // Marquer comme prêt seulement après avoir restauré toutes les valeurs
  readyToLoadDataTable.value = true

  // Appliquer l'état au DataTable après que le composant soit prêt
  if (selectedCustomDisplay.value) {
    await nextTick()
    updateDataTableState(selectedCustomDisplay.value as IPagination<any>)
  }
})

const { activeFilters, onFiltersUpdated, handleRemoveFilter } = useActiveFilter('dossiers', dataTableComponent)

const customHandleClearAllFilters = async () => {
  if (selectedCustomDisplay.value && typeof selectedCustomDisplay.value.id === 'number') {
    await selectDisplay(selectedCustomDisplay.value.id)
  } else {
    resetDataTableState()
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
  <div class="bn-scroll-parent flex flex-col pt-2">
    <div class="flex flex-shrink-0 justify-between no-label-on-toggle items-center bn-dynamic-small-p mb-2">
      <div class="flex gap-2 items-center">
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
        <div>
          <DsfrButton
            label="Télécharger"
            icon="ri-file-download-fill"
            small
            @click="download"
          />
        </div>
        <ActiveFiltersDropdown
          v-if="columnsDef"
          :filters="activeFilters"
          :column-definitions="columnsDef"
          :quick-filter-value-translations="quickFilterValueTranslations"
          :clear-all-button-label="clearAllFiltersButtonLabel"
          @request-remove-filter="handleRemoveFilter($event)"
          @request-clear-all="customHandleClearAllFilters()"
        />
      </div>
      <div class="flex justify-center items-center">
        <DemarcheDossiersDisplays
          :displays="(customDisplayWithErrors as ICustomFilter[])"
          :selected-display="(selectedCustomDisplay as ICustomFilter)"
          :pagination-changed="paginationChanged"
          :totals-allowed="totalsAllowed"
          :operation-success="customDisplayOperationSuccess"
          @create-display="createDisplay($event)"
          @update-display="updateDisplay()"
          @update-display-name="updateDisplayName($event)"
          @delete-display="deleteDisplay()"
          @select-display="selectDisplay($event)"
        />
        <DsfrButton
          id="help-button"
          label="Lancer le tutoriel"
          icon="ri-question-mark"
          icon-only
          primary
          @click="startTour"
        />
      </div>
    </div>
    <div
      v-if="demarche && columnsDef"
      class="flex-grow overflow-auto"
    >
      <DataTableServerSide
        v-if="readyToLoadDataTable"
        ref="dataTableComponent"
        v-model:pagination-dto="paginationDto"
        :right-offset="50"
        :column-defs="columnsDef"
        :loading="fetching"
        class="h-full"
        :pre-condition="!!demarche"
        :api-call="apiCall"
        :local-storage-key="localStorageDataTablePaginationKey"
        :initial-state="initialDataTableState"
        @row-click="onSelectionChanged"
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

/* :deep(.p-datatable-table-container) {
  max-height: 330px !important;
} */
</style>
