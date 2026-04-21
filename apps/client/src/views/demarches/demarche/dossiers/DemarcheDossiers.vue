<script lang="ts" setup>
import type { ICreateView, IPagination, IPatchView, IView, IDemarche, IMappingColumn } from '@biblio-num/shared'
import type { FrontIMappingColumn } from '@/stores'
import type { BNColDef } from '@/components/datatable/server-side/bn-col-def.interface'
import type { TotalsAllowed } from './DemarcheDossiersViews.vue'
import type { ViewWithErrors } from '@/views/demarches/demarche/dossiers/view-with-errors.type'

import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'

import { useViewStore, useDemarcheStore } from '@/stores'
import DemarcheDossierCellRenderer from '@/views/demarches/demarche/dossiers/DemarcheDossierCellRenderer.vue'
import { deepAlmostEqual } from '@/utils/object'
import { getDataTableFilterFromFieldType } from '@/components/datatable/server-side/filters.utils'
import { useActiveFilter } from '@/components/datatable/active-filters/useActiveFilter'
import { useTour } from '@/composables/use-tour'
import { filterTourSteps } from './TutoViewDossier.ts'
import DemarcheDossiersViews from '@/views/demarches/demarche/dossiers/DemarcheDossiersViews.vue'
import DownloadButton from '@/components/DownloadButton.vue'

const demarcheStore = useDemarcheStore()
const router = useRouter()
const route = useRoute()
const dataTableComponent = useTemplateRef('dataTableComponent')
const demarche = computed<IDemarche>(() => demarcheStore.currentDemarche as IDemarche)
const demarcheConfiguration = computed<FrontIMappingColumn[]>(() => demarcheStore.currentDemarcheFlatConfiguration)
const demarcheConfigurationHash = computed<Record<string, IMappingColumn>>(() => demarcheStore.currentDemarcheConfigurationHash)
const viewStore = useViewStore()
const view = computed<IView[]>(() => viewStore.views as IView[])
const viewWithErrors = computed<ViewWithErrors[]>(() =>
  (view.value || []).map((cf) => ({
    ...cf,
    disabledColumns: Object.keys(cf.filters || {})
      .concat(Array.isArray(cf.sorts) ? cf.sorts.map((s) => s.key) : [])
      .filter((key) => !demarcheConfigurationHash.value[key]),
  })),
)
const selectedView = ref<IView | null>(null)
const totalsAllowed = computed<TotalsAllowed[] | undefined>(() =>
  demarcheConfiguration.value
    .filter((mapping) => mapping.type === 'number' && mapping.id !== '96151176-4624-4706-b861-722d2e53545d')
    .map((mapping) => ({ id: mapping.id, columnLabel: mapping.columnLabel }) as TotalsAllowed),
)

const { startTour } = useTour({
  tourId: 'dossier-view-filter-tour', // Clé unique pour ce tour
  steps: filterTourSteps,
})

//#region 📍------ LOCAL STORAGE ------ 📍
const localStorageDataTablePaginationKey = computed(() => {
  const demarcheId = route.params.demarcheId
  const viewId = selectedView.value?.id ?? 'none'
  return `dataTable.demarche-${demarcheId}.dossiers.view-${viewId}.pagination`
})
const localStorageGroupByKey = computed(() => `dataTable.demarche-${route.params.demarcheId}.dossiers.groupBy`)
const localStorageViewIdKey = computed(() => `dataTable.demarche-${route.params.demarcheId}.dossiers.currentViewId`)
//#endregion

//#region 📍------ GROUP BY DOSSIER ------ 📍
const hasNoRepeatableField = computed(() => {
  return !demarcheStore.currentDemarche?.mappingColumns.some((m) => 'children' in m)
})

const groupByDossier = ref<boolean>(hasNoRepeatableField.value)

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
  if (!paginationDto.value.columns || !selectedView.value) {
    return false
  }
  const current = {
    columns: cloneColumns(paginationDto.value.columns),
    sorts: cloneSorts(paginationDto.value.sorts),
    filters: cloneFilters(paginationDto.value.filters),
    columnWidthById: cloneColumnWidthById(paginationDto.value.columnWidthById),
    groupByDossier: groupByDossier.value,
  }

  const saved = {
    columns: cloneColumns(selectedView.value.columns),
    sorts: cloneSorts(selectedView.value.sorts),
    filters: cloneFilters(selectedView.value.filters),
    columnWidthById: cloneColumnWidthById((selectedView.value as any).columnWidthById),
    groupByDossier: !!(selectedView.value as any).groupByDossier,
  }

  return !deepAlmostEqual(current, saved)
})

const fetching = computed(() => demarcheStore.fetching)

const columnsDef = ref<BNColDef[]>()

export type ColumnMenuTab = 'filterMenuTab' | 'generalMenuTab' | 'columnsMenuTab'

const computeColumnsDef = () => {
  columnsDef.value = [
    {
      headerName: 'Internal ID',
      field: 'dossierId',
      hide: true,
      filter: 'agNumberColumnFilter',
      menuTabs: ['filterMenuTab'],
    },
    ...demarcheConfiguration.value.map((column: FrontIMappingColumn) => {
      return {
        headerName: column.columnLabel,
        field: column.id,
        ...getDataTableFilterFromFieldType(column.type, column.formatFunctionRef),
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

const onSelectionChanged = ({ data: { dossierId: id } }: { data: { dossierId: number } }) => {
  if (id) {
    router.push({
      name: 'Dossiers',
      params: { id },
    })
  }
}

watch(demarche, async (newValue) => {
  computeColumnsDef()
  await viewStore.getViewsByDemarche(newValue.id)
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

const updateDataTableState = (selectedView?: IPagination<any>) => {
  if (dataTableComponent.value) {
    dataTableComponent.value.updateDataTableState(selectedView ?? paginationDto.value)
  }
}

//#region 📍------ CUSTOM VIEW ------ 📍
const cloneSorts = (sorts: any): any[] => {
  if (!Array.isArray(sorts)) {
    return []
  }
  return sorts.map((s) => ({ ...s }))
}

const cloneFilters = (filters: any): any => {
  if (!filters) {
    return null
  }
  try {
    return JSON.parse(JSON.stringify(filters))
  } catch {
    return null
  }
}

const cloneColumns = (columns: any): string[] => {
  return Array.isArray(columns) ? [...columns] : []
}

const cloneColumnWidthById = (map: any): Record<string, number> => {
  return map && typeof map === 'object' ? { ...map } : {}
}
const customViewOperationSuccess = ref(true)

const saveView = async () => {
  customViewOperationSuccess.value = false
  if (selectedView.value) {
    selectedView.value.groupByDossier = groupByDossier.value
    selectedView.value.columns = cloneColumns(paginationDto.value.columns)
    selectedView.value.sorts = cloneSorts(paginationDto.value.sorts)
    selectedView.value.filters = cloneFilters(paginationDto.value.filters)
    selectedView.value.columnWidthById = cloneColumnWidthById(paginationDto.value.columnWidthById)
    try {
      const dto = { ...selectedView.value, disabledColumns: undefined }
      dto.filters = dto.filters || null
      await viewStore.updateView(selectedView.value.id, dto)
      selectedView.value = viewWithErrors.value.find((cf) => cf.id === selectedView.value?.id) || null
      customViewOperationSuccess.value = true
    } catch (error) {
      import.meta.env.DEV && console.warn(error)
    }
  } else {
    throw new Error('Aucun affichage sélectionné, impossible de mettre à jour l’affichage personnalisé')
  }
}

const deleteView = async () => {
  customViewOperationSuccess.value = false
  if (selectedView.value) {
    try {
      await viewStore.deleteView(selectedView.value?.id)
      selectedView.value = null
      resetDataTableState()
      customViewOperationSuccess.value = true
    } catch (error) {
      import.meta.env.DEV && console.warn(error)
    }
    await viewStore.getViewsByDemarche(demarche.value.id)
  }
}

const updateView = async ({ viewId, viewName = '', totals = [] }: { viewId: number, viewName?: string; totals?: string[] }) => {
  customViewOperationSuccess.value = false
  const dto: IPatchView = {
    name: viewName,
  }
  if (totals) {
    dto.totals = totals.filter((tt) => tt !== 'Aucun total')
  }

  try {
    await viewStore.updateView(viewId, dto)
    if (selectedView.value && selectedView.value?.id === viewId) {
      selectedView.value.name = viewName
      selectedView.value.totals = dto.totals ?? null
    }
    customViewOperationSuccess.value = true
  } catch (error) {
    import.meta.env.DEV && console.warn(error)
  }
}

const selectView = async (id: number | null) => {
  const demarcheId = route.params.demarcheId
  const previousViewId = selectedView.value?.id ?? null
  const prevKey
    = previousViewId === null
      ? `dataTable.demarche-${demarcheId}.dossiers.view-none.pagination`
      : `dataTable.demarche-${demarcheId}.dossiers.view-${previousViewId}.pagination`

  // On démonte le DataTable d'abord pour l'empêcher de ré-écrire dans le storage
  readyToLoadDataTable.value = false
  await nextTick()

  // Si on quitte une vue vers une autre (ou vers "none") sans sauvegarde, on jette son storage
  if (previousViewId !== null && previousViewId !== id) {
    localStorage.removeItem(prevKey)
  }

  if (id === null) {
    selectedView.value = null
    localStorage.removeItem(localStorageViewIdKey.value)
    groupByDossier.value = hasNoRepeatableField.value

    initialDataTableState.value = readDataTableStateFromLocalStorage() // view-none
    readyToLoadDataTable.value = true
    return
  }
  if (viewStore.views.length === 0) {
    await viewStore.getViewsByDemarche(demarche.value.id)
  }
  selectedView.value = viewWithErrors.value.find((cf) => cf.id === id) || null
  if (selectedView.value) {
    groupByDossier.value = selectedView.value.groupByDossier
    paginationDto.value.columns = cloneColumns(selectedView.value.columns)
    paginationDto.value.sorts = cloneSorts(selectedView.value.sorts)
    paginationDto.value.filters = cloneFilters(selectedView.value.filters)
    paginationDto.value.columnWidthById = cloneColumnWidthById((selectedView.value as any).columnWidthById)

    localStorage.setItem(localStorageViewIdKey.value, `${selectedView.value.id}`)

    // on recharge un état initial depuis le localStorage de cette vue si présent, sinon fallback vue
    const savedTableState = readDataTableStateFromLocalStorage()
    initialDataTableState.value = savedTableState ?? {
      page: 1,
      perPage: 20,
      columns: paginationDto.value.columns,
      sorts: paginationDto.value.sorts,
      filters: paginationDto.value.filters,
      columnWidthById: paginationDto.value.columnWidthById,
    }

    // Forcer le DataTable à remonter avec la nouvelle clé
    readyToLoadDataTable.value = false
    await nextTick()
    readyToLoadDataTable.value = true
  } else {
    throw new Error('La vue sélectionnée n’existe pas')
  }
}

const resetCurrentViewFromBackend = async (id: number) => {
  const backendView = viewWithErrors.value.find((v) => v.id === id)
  if (!backendView) {
    return
  }

  selectedView.value = backendView
  groupByDossier.value = backendView.groupByDossier

  // écraser l'état courant par backend
  paginationDto.value.columns = cloneColumns(selectedView.value.columns)
  paginationDto.value.sorts = cloneSorts(selectedView.value.sorts)
  paginationDto.value.filters = cloneFilters(selectedView.value.filters)
  paginationDto.value.columnWidthById = cloneColumnWidthById((selectedView.value as any).columnWidthById)

  // écraser le brouillon localStorage de CETTE vue
  localStorage.setItem(
    localStorageDataTablePaginationKey.value,
    JSON.stringify({
      page: 1,
      perPage: 20,
      columns: paginationDto.value.columns,
      sorts: paginationDto.value.sorts,
      filters: paginationDto.value.filters,
      columnWidthById: paginationDto.value.columnWidthById,
    }),
  )

  // 4) forcer DataTable à se re-synchroniser
  updateDataTableState()
  dataTableComponent.value?.refresh()
}

const createView = async ({
  viewName = '',
  totals = [],
  baseViewId = null,
}: {
  viewName?: string
  totals?: string[]
  baseViewId?: number | null
}) => {
  customViewOperationSuccess.value = false

  const base = baseViewId != null ? viewWithErrors.value.find((v) => v.id === baseViewId) ?? null : null

  const dtoSource = base
    ? {
        groupByDossier: !!(base as any).groupByDossier,
        columns: cloneColumns(base.columns),
        columnWidthById: cloneColumnWidthById((base as any).columnWidthById),
        sorts: cloneSorts(base.sorts),
        filters: cloneFilters(base.filters),
      }
    : {
        groupByDossier: groupByDossier.value,
        columns: cloneColumns(paginationDto.value.columns),
        columnWidthById: cloneColumnWidthById(paginationDto.value.columnWidthById),
        sorts: cloneSorts(paginationDto.value.sorts),
        filters: cloneFilters(paginationDto.value.filters),
      }

  const createCustomFilterDto: ICreateView = {
    name: viewName,
    groupByDossier: dtoSource.groupByDossier,
    columns: dtoSource.columns,
    columnWidthById: dtoSource.columnWidthById,
    sorts: dtoSource.sorts,
    filters: dtoSource.filters,
    totals: totals.filter((tt) => tt !== 'Aucun total'),
  }

  try {
    const filterId = await viewStore.createView(createCustomFilterDto, demarche.value.id)
    await selectView(filterId)
    customViewOperationSuccess.value = true
  } catch (error) {
    import.meta.env.DEV && console.warn(error)
  }
}
//#endregion

const download = async () => {
  return demarcheStore.exportCurrentDemarcheDossiers(groupByDossier.value, paginationDto.value)
}

const readyToLoadDataTable = ref<boolean>(false)
const initialDataTableState = ref<IPagination<any> | null>(null)

const readDataTableStateFromLocalStorage = (): IPagination<any> | null => {
  const raw = localStorage.getItem(localStorageDataTablePaginationKey.value)
  if (!raw) {
    return null
  }
  try {
    return JSON.parse(raw)
  } catch (e) {
    console.warn('Erreur de lecture du localStorage DataTable', e)
    return null
  }
}

const parseQueryNumber = (raw: unknown): number | null => {
  const v = Array.isArray(raw) ? raw[0] : raw
  const n = Number.parseInt(String(v ?? ''), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

const getViewIdFromQuery = (): number | null => {
  return parseQueryNumber(route.query.viewId)
}

onMounted(async () => {
  computeColumnsDef()
  await viewStore.getViewsByDemarche(demarche.value.id)

  // 1) Vue demandée par URL (prioritaire), sinon dernière vue en localStorage
  const queryViewId = getViewIdFromQuery()

  if (queryViewId) {
    await resetCurrentViewFromBackend(queryViewId)
  } else {
    const savedViewId = Number.parseInt(localStorage.getItem(localStorageViewIdKey.value) || '-1')
    selectedView.value = savedViewId > -1 ? (viewWithErrors.value.find((v) => v.id === savedViewId) || null) : null
  }

  // 2) groupByL on prend le localStorage, sinon défaut
  if (localStorage.getItem(localStorageGroupByKey.value) === 'true') {
    groupByDossier.value = true
  } else {
    groupByDossier.value = hasNoRepeatableField.value
  }

  // 3) Préparer un état initial "source de vérité"
  // Priorité : localStorage de la vue courante (view-xx ou view-none) ; sinon fallback sur la vue ; sinon null
  const savedTableState = readDataTableStateFromLocalStorage()

  if (savedTableState) {
    initialDataTableState.value = savedTableState
  } else if (selectedView.value) {
    initialDataTableState.value = {
      page: 1,
      perPage: 20,
      columns: selectedView.value.columns ?? [],
      sorts: selectedView.value.sorts ?? [],
      filters: selectedView.value.filters ?? null,
      columnWidthById: selectedView.value.columnWidthById ?? {},
    }
  } else {
    initialDataTableState.value = null
  }

  // 4) S'assurer que paginationDto a déjà les champs attendus (utile pour les actions hors datatable)
  if (selectedView.value) {
    paginationDto.value.columns = selectedView.value.columns ?? []
    paginationDto.value.sorts = selectedView.value.sorts ?? []
    paginationDto.value.filters = selectedView.value.filters ?? null
    paginationDto.value.columnWidthById = selectedView.value.columnWidthById ?? {}
  }

  readyToLoadDataTable.value = true
})

const { activeFilters, onFiltersUpdated, handleRemoveFilter } = useActiveFilter('dossiers', dataTableComponent)

const customHandleClearAllFilters = async () => {
  resetDataTableState()
  paginationDto.value.filters = null
}

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
            Mode champ
            <VIcon :name="!groupByDossier ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'" />
          </DsfrButton>
          <DsfrButton
            :tertiary="!groupByDossier"
            :class="{ 'opacity-70': !groupByDossier }"
            :disabled="hasNoRepeatableField"
            @click="toggleView(true)"
          >
            <VIcon :name="groupByDossier ? 'ri-checkbox-circle-fill' : 'ri-checkbox-blank-circle-line'" />
            Mode dossier
          </DsfrButton>
        </div>
        <DownloadButton
          size="md"
          :tertiary="false"
          @download="download"
        />
        <ActiveFiltersDropdown
          v-if="columnsDef"
          :filters="activeFilters"
          :column-definitions="columnsDef"
          :quick-filter-value-translations="quickFilterValueTranslations"
          clear-all-button-label="Supprimer tous les filtres"
          @request-remove-filter="handleRemoveFilter($event)"
          @request-remove-all="customHandleClearAllFilters()"
        />
      </div>
      <div class="flex justify-center items-center">
        <DemarcheDossiersViews
          :views="viewWithErrors"
          :selected-view="selectedView as IView"
          :pagination-changed="paginationChanged"
          :totals-allowed="totalsAllowed"
          :operation-success="customViewOperationSuccess"
          @create-view="createView($event)"
          @save-view="saveView()"
          @update-view="updateView($event)"
          @delete-view="deleteView()"
          @select-view="selectView($event)"
          @reselect-view="resetCurrentViewFromBackend($event)"
        />
        <DsfrButton
          id="help-button"
          label="Comment fonctionne les vues"
          icon="ri-question-mark"
          icon-only
          secondary
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
</style>
