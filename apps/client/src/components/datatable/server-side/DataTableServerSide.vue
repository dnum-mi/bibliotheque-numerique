<script lang="ts" setup generic="T extends DynamicKeys">
import type { DataTableFilterMeta, DataTableFilterMetaData, DataTableOperatorFilterMetaData, DataTableSortEvent } from 'primevue/datatable'
import type { DynamicKeys, IPagination, IFilter } from '@biblio-num/shared'
import type { ApiCall } from './filters.utils'
import type { BNColDef } from '@/components/datatable/server-side/bn-col-def.interface'
import type { DisplayActiveFilter } from '../active-filters/activeFilters.type'

import { useDebounceFn, useEventListener } from '@vueuse/core'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { computed, nextTick, onMounted, onUpdated, ref, watch } from 'vue'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'

import { useAmountLines } from './useAmountLines'
import {
  serverFilterToDataTableDataType,
  dateMatchModeToServer,
  serverToPrimeVueDateMode,
  serverToPrimeVueNumberMode,
  SET_FILTER_TYPES,
  VALID_API_OPERATORS,
  numberMatchModeToServer,
} from './utils/datatable.const'
import { formatDateForApi, safeNumber, getFilters } from './utils/datatable.utils'
import { dealWithBlankAndNotBlank } from './filters.utils'

// Types étendus pour inclure filterType (métadonnée custom)
interface ExtendedDataTableOperatorFilterMetaData extends DataTableOperatorFilterMetaData {
  filterType?: string
}

//#region 📍------ Props & Emits------ 📍
const props = withDefaults(
  defineProps<{
    paginationDto?: IPagination<T>
    columnDefs: BNColDef[]
    apiCall: ApiCall<T>
    loading?: boolean
    preCondition?: boolean
    localStorageKey?: string
    rightOffset?: number
    initialState?: IPagination<T> | null
  }>(),
  {
    paginationDto: () => ({
      page: 1,
      perPage: 20,
      sorts: [],
      filters: null,
      columns: [],
    }),
    rightOffset: 38,
    localStorageKey: undefined,
    initialState: null,
  },
)

const emit = defineEmits<{
  'update:paginationDto': [p: IPagination<T>]
  filtersUpdated: [filters: DisplayActiveFilter[]]
  rowClick: [event: { data: T; column?: BNColDef; field?: string }]
}>()
//#endregion

//#region 📍------ Constantes ------ 📍
const DEFAULT_PER_PAGE = 20
const ROWS_PER_PAGE_OPTIONS = [20, 50, 100]
const OFFSET_BOTTOM_PX = 82
const DEFAULT_COL_WIDTH = 180
//#endregion

//#region 📍------ State: Data & Pagination ------ 📍
const isLoadingRows = ref(false)
const isReadyToWatch = ref(false)
const hasInitialDataLoaded = ref(false)

const tableKey = ref(0)
const currentPage = ref(1)
const perPage = ref(DEFAULT_PER_PAGE)
const totalRecords = ref(0)
const rowData = ref<T[] | undefined>(undefined)
//#endregion

//#region 📍------ State: Columns (selection/order/width) ------ 📍
const displayColumns = ref(false)

const selectedColumnIds = ref<string[]>(props.columnDefs.filter((c) => !c.hide && c.field).map((c) => c.field!))

const columnWidthById = ref<Record<string, number>>({})
//#endregion

//#region 📍------ State: Filters & Sort ------ 📍
type SortItem = { key: string; order: 'ASC' | 'DESC' }
const sort = ref<SortItem[]>([])
const filters = ref<DataTableFilterMeta>(getFilters(props.columnDefs))
//#endregion

//#region 📍------ State: Scroll ------ 📍
const scrollHeight = ref('flex')
const dataTableRef = useTemplateRef('dataTable')
//#endregion

//#region 📍------ Helpers pure ------ 📍
// Retourne uniquement les ids de colonnes "disponibles" (non hide + field défini).
const getAvailableColumnIds = (): string[] => props.columnDefs.filter((c) => !c.hide && c.field).map((c) => c.field!)

/**
 * Utilitaire de tri des définitions de colonnes par une liste d’ids.
 * - ignore les ids inconnus
 * - garde les colonnes non mentionnées à la fin
 */
function orderColumnDefs (defs: BNColDef[], orderIds: string[]): BNColDef[] {
  const byId = new Map(defs.filter((d) => d.field).map((d) => [d.field!, d]))
  const ordered: BNColDef[] = []

  for (const id of orderIds) {
    const def = byId.get(id)
    if (!def) {
      continue
    }
    ordered.push(def)
    byId.delete(id)
  }

  ordered.push(...byId.values())
  return ordered
}

function getColumnDataType (col: BNColDef): string | undefined {
  if (typeof col.filter === 'string') {
    return serverFilterToDataTableDataType[col.filter]
  }
  return undefined
}

function shouldShowFilterControls (col: BNColDef): boolean {
  if (typeof col.filter === 'string') {
    return !SET_FILTER_TYPES.includes(col.filter as any)
  }
  return true
}

//#endregion

//#region 📍------ Computed: Pagination UI ------ 📍
const paginationPages = computed(() => {
  const total = Number(totalRecords.value)
  const rows = Number(perPage.value)

  if (!Number.isFinite(total) || total <= 0) {
    return []
  }
  if (!Number.isFinite(rows) || rows <= 0) {
    return []
  }

  const pageCount = Math.ceil(total / rows)
  if (!Number.isFinite(pageCount) || pageCount <= 0) {
    return []
  }

  return Array.from({ length: pageCount }, (_, i) => ({
    title: String(i + 1),
    href: `#${i + 1}`,
    label: String(i + 1),
  }))
})

const first = computed(() => (currentPage.value - 1) * perPage.value)
//#endregion

//#region 📍------ Computed: Column defs ------ 📍
const visibleColumnDefs = computed(() => props.columnDefs.filter((c) => !c.hide && c.field))

const selectedVisibleColumnDefs = computed(() => {
  const selected = new Set(selectedColumnIds.value)
  return visibleColumnDefs.value.filter((c) => selected.has(c.field!))
})

// Colonnes du tableaux
const filteredColumnDefs = computed(() => orderColumnDefs(selectedVisibleColumnDefs.value, selectedColumnIds.value))

// Colonne de la liste de droite
const columnDefsForList = computed(() => {
  const selectedSet = new Set(selectedColumnIds.value)

  const selectedDefs = orderColumnDefs(
    visibleColumnDefs.value.filter((c) => selectedSet.has(c.field!)),
    selectedColumnIds.value,
  )

  const notSelectedDefs = visibleColumnDefs.value.filter((c) => !selectedSet.has(c.field!))

  return [...selectedDefs, ...notSelectedDefs]
})
//#endregion

//#region 📍------ Computed: filtersToSend ------ 📍
// filtersToSend is the filter from PrimeView in an old AgGrid format so that backend understands
const filtersToSend = computed<Record<keyof typeof props.columnDefs, IFilter>>(() => {
  const result: Record<string, IFilter> = {}

  for (const [key, filter] of Object.entries(filters.value)) {
    const colDef = props.columnDefs.find((col) => col.field === key)
    const filterType = typeof colDef?.filter === 'string' ? colDef.filter : ''
    const mappedType = colDef ? serverFilterToDataTableDataType[filterType] : undefined
    const currentType = (filter as any).filterType || mappedType || 'text'

    const apiType = currentType === 'numeric' ? 'number' : currentType

    const resolveOperator = (mode: string) => {
      if (VALID_API_OPERATORS.includes(mode)) {
        return mode
      }
      if (currentType === 'date') {
        return dateMatchModeToServer[mode] || 'equals'
      }
      if (currentType === 'numeric') {
        return numberMatchModeToServer[mode] || 'equals'
      }
      if (currentType === 'text') {
        return mode === FilterMatchMode.NOT_EQUALS ? 'notEqual' : mode
      }
      return mode
    }

    const resolveValue = (val: any) => {
      if (currentType === 'date') {
        return formatDateForApi(val)
      }
      if (currentType === 'numeric') {
        return safeNumber(val)
      }
      return val
    }

    // Filtre Simple ('value' directe)
    if ('value' in (filter as DataTableFilterMetaData)) {
      const metaFilter = filter as DataTableFilterMetaData

      if (metaFilter.value && typeof metaFilter.value === 'object' && 'filterType' in metaFilter.value) {
        result[key] = metaFilter.value
        continue
      }

      const isBlankOrNotBlank = metaFilter.matchMode === 'blank' || metaFilter.matchMode === 'notBlank'
      if (isBlankOrNotBlank) {
        metaFilter.value = metaFilter.matchMode
      }
      if (metaFilter.value !== null && metaFilter.value !== undefined) {
        const isArray = Array.isArray(metaFilter.value)

        // @ts-expect-error TS2322
        result[key] = {
          filterType: isArray ? 'set' : apiType,
          condition1: {
            type: isArray || isBlankOrNotBlank ? undefined : resolveOperator(metaFilter.matchMode as string),
            filter: isArray ? metaFilter.value.map(({ code }: { code: string }) => code) : resolveValue(metaFilter.value),
          },
        }
        continue
      }
    }

    // Filtre avec Opérateur
    if ('operator' in (filter as DataTableOperatorFilterMetaData)) {
      const metaFilter = filter as DataTableOperatorFilterMetaData
      if (!metaFilter.constraints || !Array.isArray(metaFilter.constraints)) {
        continue
      }
      const constraints = metaFilter.constraints
      const firstConstraint = constraints[0]

      if (firstConstraint && firstConstraint.value && typeof firstConstraint.value === 'object' && 'filterType' in firstConstraint.value) {
        const customValue = firstConstraint.value as any
        result[key] = {
          filterType: customValue.filterType,
          condition1: customValue,
        }
        continue
      }

      // Gestion Date (besoin filterTo)
      if (firstConstraint && firstConstraint.value && currentType === 'date') {
        result[key] = {
          filterType: 'date',
          condition1: {
            type: resolveOperator(firstConstraint.matchMode as string),
            filter: resolveValue(firstConstraint.value),
            filterTo: null,
          },
        }
        continue
      }

      constraints.forEach((c) => {
        if (c.matchMode === 'blank' || c.matchMode === 'notBlank') {
          c.value = c.matchMode
        }
      })

      const hasValue1 = constraints.at(0)?.value !== null && constraints.at(0)?.value !== undefined
      const hasValue2 = constraints.at(1)?.value !== null && constraints.at(1)?.value !== undefined

      if (hasValue1 || hasValue2) {
        const isSetFilter = Array.isArray(constraints[0]!.value)
        const finalType = isSetFilter ? 'set' : apiType

        const output: any = {
          filterType: finalType,
          operator: metaFilter.operator === FilterOperator.AND ? 'AND' : 'OR',
          condition1: {
            filterType: finalType,
            type: isSetFilter ? undefined : resolveOperator(constraints[0]!.matchMode as string),
            filter: isSetFilter ? constraints[0]!.value.map((v: any) => v.code || v) : resolveValue(constraints[0]!.value),
          },
        }

        if (hasValue2) {
          output.condition2 = {
            filterType: finalType,
            type: resolveOperator(constraints[1]!.matchMode as string),
            filter: resolveValue(constraints[1]!.value),
          }
        }

        if (!hasValue2) {
          delete output.operator
        }

        result[key] = output
      }
    }
  }

  return result as Record<keyof typeof props.columnDefs, IFilter>
})
//#endregion

//#region 📍------ DTO & Persistance ------ 📍
// single point of entry to build dto
const buildDto = (page: number): IPagination<T> => ({
  sorts: sort.value,
  filters: Object.keys(filtersToSend.value ?? {}).length > 0 ? (filtersToSend.value as any) : null,
  columns: selectedColumnIds.value,
  columnWidthById: columnWidthById.value as any,
  perPage: +perPage.value,
  page,
})

// emit and save to local storage
const persistDto = (page: number = currentPage.value): IPagination<T> => {
  const dto = buildDto(page)
  emit('update:paginationDto', dto)
  saveToLocalStorage(dto)
  return dto
}
//#endregion

//#region 📍------ API: fetch + refresh ------ 📍
type LoadMode = 'initial' | 'light'

const getRows = async (
  page: number = currentPage.value,
  mode?: LoadMode,
) => {
  // Si un filtre set/enum est vide => 0 résultat => PAS d'API
  if (shouldReturnEmptyResult(filtersToSend.value as any)) {
    // on met l'UI en cohérence
    rowData.value = []
    totalRecords.value = 0
    currentPage.value = 1

    // stop loaders si besoin
    stopStoryboardTimer?.()
    finishLoadingStoryboardStop?.()
    if (typeof stopLightLoading === 'function') {
      await stopLightLoading()
    }
    isLoadingRows.value = false
    return
  }

  const effectiveMode: LoadMode
    = mode ?? (rowData.value == null ? 'initial' : 'light')

  if (effectiveMode === 'initial') {
    isLoadingRows.value = true
    startLoadingStoryboard()
  } else {
    startLightLoading()
  }

  const dto = persistDto(page)

  try {
    const response = await props.apiCall(dto)
    const data = Array.isArray(response?.data) ? response.data : []
    const total = Number(response?.total)

    rowData.value = data as T[]
    totalRecords.value = Number.isFinite(total) && total >= 0 ? total : data.length
    currentPage.value = page

    if (effectiveMode === 'initial') {
      const elapsed = Date.now() - loadingStartedAt
      if (stepIndex.value === 1) {
        isLoadingRows.value = false
      } else if (elapsed < TARGET_MS) {
        await finishLoadingStoryboardFast()
      } else {
        finishLoadingStoryboardStop()
      }
    }
  } catch (error) {
    console.warn(error)
    rowData.value = []
    totalRecords.value = 0
    currentPage.value = 1

    if (effectiveMode === 'initial') {
      await finishLoadingStoryboardFast()
    }
  } finally {
    if (effectiveMode === 'initial') {
      isLoadingRows.value = false
    } else {
      await stopLightLoading()
    }
  }
}

const saveChanges = () => {
  if (!hasInitialDataLoaded.value) {
    return
  }
  persistDto(currentPage.value)
}

function refreshTable () {
  getRows(currentPage.value, 'initial')
}

//#endregion

//#region 📍------ Columns: order ------ 📍
const onColumnReorder = (event: { dragIndex: number; dropIndex: number }) => {
  const cur = [...selectedColumnIds.value]

  const moved = cur.splice(event.dragIndex, 1)[0]
  if (!moved) {
    return
  }

  cur.splice(event.dropIndex, 0, moved)
  selectedColumnIds.value = cur

  saveChanges()
  nextTick(() => {
    snapshotMissingColumnWidths()
    applyColumnWidthsToColgroup()
  })
}

function resetColumnOrder () {
  const defaultOrder = props.columnDefs
    .filter((col) => !col.hide && selectedColumnIds.value.includes(col.field ?? ''))
    .map((col) => col.field ?? '')
    .filter(Boolean)

  selectedColumnIds.value = [...defaultOrder]

  tableKey.value++

  nextTick(() => {
    saveChanges()
    applyColumnWidthsToColgroup()
  })
}

//#endregion

//#region 📍------ Columns: width ------ 📍
const onColResize = (event: { element: HTMLElement; delta: number }) => {
  const headerElement = event.element as HTMLTableCellElement
  const table = headerElement.closest('table')
  if (!table) {
    return
  }

  const headerRow = table.querySelector('thead tr')
  if (!headerRow) {
    return
  }

  const headers = Array.from(headerRow.querySelectorAll('th'))
  const columnIndex = headers.indexOf(headerElement)
  if (columnIndex === -1) {
    return
  }

  const column = filteredColumnDefs.value[columnIndex]
  if (!column?.field) {
    return
  }

  const field = column.field
  const currentWidth = headerElement.offsetWidth

  columnWidthById.value = {
    ...columnWidthById.value,
    [field]: currentWidth,
  }

  saveChanges()
}

const snapshotMissingColumnWidths = () => {
  const root = dataTableRef.value as HTMLElement | null
  if (!root) {
    return
  }

  const table = root.querySelector('table') as HTMLTableElement | null
  if (!table) {
    return
  }

  const headerRow = table.querySelector('thead tr')
  if (!headerRow) {
    return
  }

  const ths = Array.from(headerRow.querySelectorAll('th')) as HTMLTableCellElement[]
  const visibleCols = filteredColumnDefs.value
  if (!ths.length || !visibleCols.length) {
    return
  }

  const next = { ...columnWidthById.value }
  let changed = false

  for (let i = 0; i < visibleCols.length; i++) {
    const field = visibleCols[i]?.field
    const th = ths[i]
    if (!field || !th) {
      continue
    }

    if (next[field] == null) {
      const w = th.offsetWidth

      // Ne snapshot pas des tailles “squeezées” (42px etc.)
      if (w && w >= DEFAULT_COL_WIDTH) {
        next[field] = w
        changed = true
      }
    }
  }

  if (changed) {
    columnWidthById.value = next
  }
}

const applyColumnWidthsToColgroup = () => {
  const root = dataTableRef.value as HTMLElement | null
  if (!root) {
    return
  }

  const tables = root.querySelectorAll('table')

  tables.forEach((table) => {
    const cols = Array.from(table.querySelectorAll('colgroup col')) as HTMLTableColElement[]
    if (!cols.length) {
      return
    }

    const visibleCols = filteredColumnDefs.value

    cols.forEach((colEl, i) => {
      const def = visibleCols[i]
      const field = def?.field
      if (!field) {
        return
      }

      const w = columnWidthById.value[field]

      colEl.style.removeProperty('width')
      colEl.style.removeProperty('min-width')
      colEl.style.removeProperty('max-width')

      if (w && w > 0) {
        colEl.style.width = `${w}px`
        colEl.style.minWidth = `${w}px`
      }
    })
  })
}

function resetColumnsWidth () {
  columnWidthById.value = {}
  tableKey.value++
  saveChanges()
}

//#endregion

//#region 📍------ Filters ------ 📍
const notifyFilterChanged = () => {
  const activeFilters: DisplayActiveFilter[] = []

  for (const [colId, filter] of Object.entries(filters.value)) {
    if ('value' in (filter as DataTableFilterMetaData)) {
      const metaFilter = filter as DataTableFilterMetaData
      if (metaFilter.value !== null && metaFilter.value !== undefined) {
        const colDef = props.columnDefs.find((col) => col.field === colId)
        const filterType = typeof colDef?.filter === 'string' ? colDef.filter : ''
        const isSetFilter = SET_FILTER_TYPES.includes(filterType as any)

        if (isSetFilter) {
          const values = Array.isArray(metaFilter.value) ? metaFilter.value.map((item) => item.code || item) : [metaFilter.value]
          activeFilters.push({ colId, filterType: 'set', values } as DisplayActiveFilter)
        } else {
          activeFilters.push({
            colId,
            filterType: 'text',
            type: metaFilter.matchMode,
            filter: metaFilter.value,
            values: [],
          } as DisplayActiveFilter)
        }
      }
    } else if ('operator' in (filter as DataTableOperatorFilterMetaData)) {
      const metaFilter = filter as DataTableOperatorFilterMetaData
      const activeConstraints = metaFilter.constraints.filter((c) => c.value !== null && c.value !== undefined)

      if (activeConstraints.length > 0) {
        const colDef = props.columnDefs.find((col) => col.field === colId)
        const filterType = typeof colDef?.filter === 'string' ? colDef.filter : ''
        const isSetFilter = SET_FILTER_TYPES.includes(filterType as any)

        if (isSetFilter && activeConstraints[0]) {
          const values = Array.isArray(activeConstraints[0].value)
            ? activeConstraints[0].value.map((item) => item.code || item)
            : [activeConstraints[0].value]

          activeFilters.push({ colId, filterType: 'set', values } as DisplayActiveFilter)
        } else {
          const filterData: DisplayActiveFilter = { colId, filterType: 'text', values: [] }

          if (activeConstraints.length === 1 && activeConstraints[0]) {
            filterData.type = activeConstraints[0].matchMode
            filterData.filter = activeConstraints[0].value
          } else if (activeConstraints.length >= 2 && activeConstraints[0] && activeConstraints[1]) {
            filterData.operator = metaFilter.operator as 'AND' | 'OR'
            filterData.condition1 = { type: activeConstraints[0].matchMode, filter: activeConstraints[0].value }
            filterData.condition2 = { type: activeConstraints[1].matchMode, filter: activeConstraints[1].value }
          }

          activeFilters.push(filterData)
        }
      }
    }
  }

  emit('filtersUpdated', activeFilters)
}

async function clearAllFilters () {
  // coupe les watchers pour éviter double getRows / double persist
  isReadyToWatch.value = false

  filters.value = getFilters(props.columnDefs)
  tableKey.value++

  await nextTick()

  // un seul fetch + une seule persistance
  await getRows(1, 'initial')

  isReadyToWatch.value = true
  notifyFilterChanged()
}

async function removeFilter (colId: string): Promise<void> {
  if (!filters.value[colId]) {
    return
  }

  isReadyToWatch.value = false

  const emptyFilters = getFilters(props.columnDefs)
  // @ts-expect-error TS2322
  filters.value = { ...filters.value, [colId]: emptyFilters[colId] }

  await nextTick()
  await getRows(1, 'initial')

  isReadyToWatch.value = true
  notifyFilterChanged()
}

function shouldReturnEmptyResult (filters: Record<string, any> | null | undefined): boolean {
  if (!filters) {
    return false
  }

  for (const f of Object.values(filters)) {
    const c1 = (f as any)?.condition1 ?? f
    if (!c1) {
      continue
    }
    if (c1.filterType && Array.isArray(c1.filter)) {
      const includeEmpty = !!c1.includeEmpty

      // "tout décoché" + on n'inclut pas les vides => ça ne peut matcher rien
      if (c1.filter.length === 0 && !includeEmpty) {
        return true
      }
    }
  }

  return false
}
//#endregion

//#region 📍------ Sort ------ 📍
function onSortChanged (sortEvent: DataTableSortEvent) {
  const { sortField, sortOrder } = sortEvent
  const isSorted = sortField !== null && sortOrder !== null
  sort.value = isSorted ? [{ key: sortField as string, order: sortOrder === 1 ? 'ASC' : 'DESC' }] : []
  getRows(1, 'initial')
}

//#endregion

//#region 📍------ Storage ------ 📍
const saveToLocalStorage = (dto: IPagination<T>) => {
  if (!props.localStorageKey) {
    return
  }
  try {
    localStorage.setItem(`${props.localStorageKey}`, JSON.stringify(dto))
  } catch (e) {
    console.warn('Erreur de sauvegarde dans localStorage', e)
  }
}

const _restoreFilterFromDto = (dto: IPagination<T>) => {
  if (dto.filters) {
    const rebuiltFilters = getFilters(props.columnDefs)

    Object.entries(dto.filters).forEach(([key, savedValue]) => {
      const colDef = props.columnDefs.find((c) => c.field === key)
      if (!colDef) {
        return
      }

      const filterName = typeof colDef.filter === 'string' ? colDef.filter : 'agTextColumnFilter'

      const mappedType = serverFilterToDataTableDataType[filterName]
      const isDate = mappedType === 'date'
      const isNumber = mappedType === 'numeric'
      const isBoolean = mappedType === 'boolean'
      const isSet = (SET_FILTER_TYPES.includes(filterName as any) || mappedType === 'set') && !isBoolean

      const primeVueType = mappedType || 'text'

      const cond1 = (savedValue as any).condition1
      const cond2 = (savedValue as any).condition2
      const operator = (savedValue as any).operator === 'OR' ? FilterOperator.OR : FilterOperator.AND

      if (isSet && cond1) {
        let valueToRestore = null

        if (typeof cond1 === 'object' && ('includeEmpty' in cond1 || 'filterType' in cond1) && !Array.isArray(cond1)) {
          valueToRestore = cond1
        } else if (Array.isArray(cond1.filter)) {
          valueToRestore = { filterType: 'set', includeEmpty: false, filter: cond1.filter }
        } else if (cond1.filter !== undefined) {
          valueToRestore = { filterType: 'set', includeEmpty: false, filter: [cond1.filter] }
        }

        if (valueToRestore) {
          rebuiltFilters[key] = {
            operator: FilterOperator.AND,
            constraints: [{ value: valueToRestore, matchMode: FilterMatchMode.EQUALS }],
            filterType: 'set',
          } as ExtendedDataTableOperatorFilterMetaData
        }
      } else if (isBoolean && cond1) {
        let rawValues: string[] = []

        if (Array.isArray(cond1.filter)) {
          rawValues = cond1.filter.map(String)
        } else if (cond1.filter !== undefined) {
          rawValues = [String(cond1.filter)]
        }

        const booleanOptions = [
          { name: 'Oui', code: 'true' },
          { name: 'Non', code: 'false' },
        ]
        const selectedOptions = booleanOptions.filter((opt) => rawValues.includes(opt.code))

        rebuiltFilters[key] = {
          operator: FilterOperator.AND,
          constraints: [{ value: selectedOptions, matchMode: FilterMatchMode.IN }],
          filterType: 'boolean',
        } as ExtendedDataTableOperatorFilterMetaData
      } else if (cond1) {
        const restoreConstraint = (c: any) => {
          if (!c) {
            return null
          }

          let val = c.filter
          let mode = c.type

          if (isDate) {
            val = val ? new Date(val) : null
            mode = serverToPrimeVueDateMode[c.type] || FilterMatchMode.DATE_IS
          } else if (isNumber) {
            val = Number(val)
            mode = serverToPrimeVueNumberMode[c.type] || FilterMatchMode.EQUALS
          }

          return { value: val, matchMode: mode }
        }

        const constraint1 = restoreConstraint(cond1)
        const constraint2 = restoreConstraint(cond2)

        if (constraint1) {
          rebuiltFilters[key] = {
            operator,
            constraints: [constraint1, ...(constraint2 ? [constraint2] : [])],
            filterType: primeVueType,
          } as ExtendedDataTableOperatorFilterMetaData
        }
      }
    })

    filters.value = rebuiltFilters
  }
}

const _restoreSortFromDto = (dto: IPagination<T>) => {
  if (dto.sorts && dto.sorts.length > 0) {
    const sortItem = dto.sorts.at(0)
    if (sortItem) {
      sort.value = [{ key: sortItem.key, order: sortItem.order }]
    }
  } else {
    sort.value = []
  }
}

// restore column and their order
const _restoreColumnFromDto = (dto: IPagination<T>) => {
  const available = getAvailableColumnIds()

  if (dto.columns) {
    // dto.columns = sélection + ordre
    const valid = (dto.columns as string[]).filter((id) => available.includes(id))

    // si jamais c'est vide (corrompu ou vieux dto), fallback sur défaut
    selectedColumnIds.value = valid.length > 0 ? valid : available
    return
  }

  // pas de dto.columns -> comportement par défaut (tout sélectionné)
  selectedColumnIds.value = available
}

const _restoreColumnWidthFromDto = (dto: IPagination<T>) => {
  if (!dto.columnWidthById) {
    return
  }
  columnWidthById.value = dto.columnWidthById as Record<string, number>
  tableKey.value++
  nextTick(() => {
    snapshotMissingColumnWidths()
    applyColumnWidthsToColgroup()
  })
}

const _restorePaginationFromDto = (dto: IPagination<T>) => {
  currentPage.value = dto.page ?? 1
  perPage.value = dto.perPage ?? DEFAULT_PER_PAGE
}

const restoreFromDto = (dto: IPagination<T>) => {
  _restoreFilterFromDto(dto)
  _restoreSortFromDto(dto)
  _restoreColumnFromDto(dto)
  _restoreColumnWidthFromDto(dto)
  _restorePaginationFromDto(dto)
}
//#endregion

//#region 📍------ Init / Lifecycle ------ 📍
const initializeTable = async () => {
  if (hasInitialDataLoaded.value) {
    return
  }

  isReadyToWatch.value = false

  let startDto: IPagination<T> | null = null
  if (props.initialState) {
    startDto = props.initialState
  } else if (props.localStorageKey) {
    try {
      const saved = localStorage.getItem(props.localStorageKey)
      if (saved) {
        startDto = JSON.parse(saved)
      }
    } catch (e) {
      console.warn(e)
    }
  }

  if (startDto) {
    restoreFromDto(startDto)
  }

  await nextTick()
  snapshotMissingColumnWidths()
  applyColumnWidthsToColgroup()

  await getRows(currentPage.value, 'initial')

  hasInitialDataLoaded.value = true
  isReadyToWatch.value = true
  notifyFilterChanged()
}

const computeScrollHeight = () => {
  if (!dataTableRef.value) {
    return
  }

  const height = window.innerHeight
  const top = dataTableRef.value.getBoundingClientRect().top + window.scrollY

  const newHeight = `${height - top - OFFSET_BOTTOM_PX}px`
  if (scrollHeight.value !== newHeight) {
    scrollHeight.value = newHeight
  }
}

const debouncedCompute = useDebounceFn(computeScrollHeight, 100)

onMounted(() => computeScrollHeight())
useEventListener(window, 'resize', debouncedCompute)
onUpdated(() => computeScrollHeight())

useAmountLines()
//#endregion

//#region 📍------ Click events ------ 📍
const onRowClick = (event: { data: T; originalEvent?: Event }) => {
  emit('rowClick', { data: event.data })
}

const onPage = (event: { first: number; rows: number }) => {
  if (totalRecords.value === 0 && isLoadingRows.value) {
    return
  }
  const newPage = Math.floor(event.first / event.rows) + 1
  if (currentPage.value !== newPage) {
    currentPage.value = newPage
  }
}

const updateDataTableState = (dto: IPagination<T>) => {
  restoreFromDto(dto)
}
//#endregion

//#region 📍------ Watchers ------ 📍
watch(
  selectedColumnIds,
  (newSelectedIds, previousSelectedIds) => {
    if (!isReadyToWatch.value) {
      return
    }

    const available = getAvailableColumnIds()
    const cleaned = newSelectedIds.filter((id) => available.includes(id))

    if (cleaned.length !== newSelectedIds.length) {
      selectedColumnIds.value = cleaned
      return
    }

    // --- Détecter "reorder only" : même set, même taille, ordre différent
    const sameLength = previousSelectedIds.length === cleaned.length
    const sameSet
      = sameLength && previousSelectedIds.every((id) => cleaned.includes(id)) && cleaned.every((id) => previousSelectedIds.includes(id))
    const orderChanged = sameSet && previousSelectedIds.some((id, i) => cleaned[i] !== id)

    // find deleted column id to remove its eventual filter or sort property
    if (previousSelectedIds.length > cleaned.length) {
      const deletedId = previousSelectedIds.find((a) => !cleaned.includes(a))
      if (deletedId) {
        removeFilter(deletedId)
        sort.value = sort.value.filter((s) => s.key !== deletedId)
      }
    }

    // PrimeVue ne ré-applique pas toujours l’ordre des Column -> remount DataTable
    if (orderChanged) {
      tableKey.value++
    }

    nextTick(() => applyColumnWidthsToColgroup())

    if (hasInitialDataLoaded.value) {
      saveChanges()

      // Reorder pur : pas besoin de refetch
      if (!orderChanged) {
        getRows(1, 'initial')
      }
    }
  },
  { deep: true },
)

watch(
  () => [props.preCondition, props.apiCall],
  ([preCondition, apiCall]) => {
    if (preCondition && apiCall) {
      initializeTable()
    }
  },
  { immediate: true },
)

watch(
  filters,
  () => {
    if (!isReadyToWatch.value) {
      return
    }
    notifyFilterChanged()
  },
  { deep: true },
)

watch(
  filtersToSend,
  () => {
    if (!isReadyToWatch.value) {
      return
    }

    // On repasse page 1 dès qu’un filtre change
    currentPage.value = 1
    saveChanges()

    getRows(1, 'initial')
  },
  { deep: true },
)

watch(perPage, () => {
  if (!isReadyToWatch.value) {
    return
  }
  getRows(1, 'initial')
})
//#endregion

//#region 📍------ User Friendly Chargement ------ 📍
type Step = { key: string; title: string; short: string }

const steps: Step[] = [
  { key: 'cols', title: 'Sélection des colonnes', short: 'Colonnes' },
  { key: 'filters', title: 'Application des filtres', short: 'Filtres' },
  { key: 'sort', title: 'Ordonnancement des données', short: 'Tri' },
  { key: 'totals', title: 'Calcul des totaux', short: 'Totaux' },
  { key: 'render', title: 'Présentation finale', short: 'Affichage' },
]

// on fixe à 5 seconde le temps du logo par default.
const TARGET_MS = 5000
const stepIndex = ref(0)
const currentStep = computed(() => steps[stepIndex.value] ?? steps.at(-1)!)
const isFinalizing = ref(false)

// progress 0..100
const progress = ref(0)

let loadingStartedAt = 0
let timer: number | null = null

function stopStoryboardTimer () {
  if (timer) {
    window.clearInterval(timer)
    timer = null
  }
}

function startLoadingStoryboard () {
  loadingStartedAt = Date.now()
  stepIndex.value = 0
  progress.value = 0
  isFinalizing.value = false

  stopStoryboardTimer()

  timer = window.setInterval(() => {
    const elapsed = Date.now() - loadingStartedAt

    const raw = Math.floor((elapsed / TARGET_MS) * steps.length)
    stepIndex.value = Math.min(raw, steps.length - 1)

    // 0..92 tant que pas terminé pour ne pas frustrer
    const p = Math.min(92, Math.floor((elapsed / TARGET_MS) * 100))
    progress.value = Math.max(progress.value, p)

    if (elapsed > TARGET_MS) {
      isFinalizing.value = true
      // petit “respire” en final : 92..98 en boucle lente
      progress.value = Math.min(98, progress.value + 1)
    }
  }, 80)
}

async function finishLoadingStoryboardFast () {
  stopStoryboardTimer()
  isFinalizing.value = false

  // accélère les dernières étapes pour finir le log, pour un effet de performance
  while (stepIndex.value < steps.length - 1) {
    stepIndex.value++
    progress.value = Math.min(99, progress.value + 10)
    await new Promise((r) => setTimeout(r, 70))
  }

  progress.value = 100
  await new Promise((r) => setTimeout(r, 140))
}

//#region 📍------ Petit chargement ------ 📍
const isRefreshing = ref(false)

const LIGHT_DELAY_MS = 220
const LIGHT_MIN_SHOW_MS = 300

let lightDelayTimer: number | null = null
let lightShownAt = 0

function finishLoadingStoryboardStop () {
  if (timer) {
    window.clearInterval(timer)
    timer = null
  }
  progress.value = 100
  isFinalizing.value = false
}

function startLightLoading () {
  // anti flicker
  if (lightDelayTimer) {
    window.clearTimeout(lightDelayTimer)
  }
  lightDelayTimer = window.setTimeout(() => {
    isRefreshing.value = true
    lightShownAt = Date.now()
  }, LIGHT_DELAY_MS)
}

async function stopLightLoading () {
  if (lightDelayTimer) {
    window.clearTimeout(lightDelayTimer)
    lightDelayTimer = null
  }
  if (!isRefreshing.value) {
    return
  }

  const elapsed = Date.now() - lightShownAt
  const remaining = Math.max(0, LIGHT_MIN_SHOW_MS - elapsed)
  if (remaining) {
    await new Promise(r => setTimeout(r, remaining))
  }

  isRefreshing.value = false
}
//#endregion
//#endregion

//#region 📍------ Expose ------ 📍
defineExpose({
  refresh: refreshTable,
  clearAllFilters,
  removeFilter,
  updateDataTableState,
  resetColumnOrder,
  resetColumnsWidth,
})
//#endregion
</script>

<template>
  <div
    ref="dataTable"
    class="h-full flex relative border-shadow"
    :class="{ loading: isLoadingRows }"
  >
    <DataTable
      :key="tableKey"
      v-model:filters="filters"
      class="m-w-full h-full"
      :style="{ width: `calc(100% - ${rightOffset}px)` }"
      :value="rowData"
      striped-rows
      paginator
      lazy
      resizable-columns
      reorderable-columns
      removable-sort
      scrollable
      column-resize-mode="expand"
      :rows="perPage"
      :rows-per-page-options="ROWS_PER_PAGE_OPTIONS"
      :first="first"
      :loading="isLoadingRows || loading"
      :total-records="totalRecords"
      :scroll-height="scrollHeight"
      scroll-width="max-content"
      filter-display="menu"
      row-hover
      :sort-field="sort[0]?.key"
      :sort-order="sort[0]?.order === 'ASC' ? 1 : sort[0]?.order === 'DESC' ? -1 : 0"
      @page="onPage"
      @column-resize-end="onColResize($event)"
      @column-reorder="onColumnReorder($event)"
      @sort="onSortChanged($event)"
      @row-click="onRowClick($event)"
    >
      <template #loadingicon>
        <div class="bn-loadwrap">
          <div class="bn-logo" :style="{ '--p': `${progress}%` }" aria-hidden="true" />

          <div class="bn-loadtext">
            <strong>{{ currentStep.title }}</strong>
            <span v-if="isFinalizing" class="bn-dots">…</span>
          </div>
        </div>
      </template>
      <template #paginatorstart>
        <Button
          type="button"
          icon="pi pi-refresh"
          text
        />
      </template>
      <template #paginatorend>
        <Button
          type="button"
          icon="pi pi-download"
          text
        />
      </template>
      <Column
        v-for="col of filteredColumnDefs"
        :key="col.field"
        :field="col.field"
        :header="col.headerName"
        :data-type="getColumnDataType(col)"
        :sortable="col.sortable === false ? undefined : true"
        :show-add-button="shouldShowFilterControls(col)"
        :show-filter-match-modes="shouldShowFilterControls(col)"
        :show-filter-menu="!col.suppressHeaderMenuButton"
        :header-style="
          col.field
            ? {
              width: columnWidthById[col.field] ? `${columnWidthById[col.field]}px` : `${DEFAULT_COL_WIDTH}px`,
            }
            : undefined
        "
        :title="col.headerName"
      >
        <template #body="{ data }">
          <template v-if="col.cellRenderer">
            <component
              :is="col.cellRenderer"
              :style="col.cellStyle"
              :params="{ row: data, value: data[col.field!], ...col.cellRendererParams }"
            />
          </template>
          <template v-else-if="col.valueFormatter && typeof col.valueFormatter === 'function' && col.field">
            <span :style="col.cellStyle as unknown as string">
              {{ col.valueFormatter({ value: data[col.field] } as any) }}
            </span>
          </template>
          <template v-else>
            <span :style="col.cellStyle as unknown as string">
              {{ data[col.field!] }}
            </span>
          </template>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <template v-if="col.filter === 'agSetColumnFilter'">
            <PrimeSetFilter
              v-model="filterModel.value"
              :filter-callback="filterCallback"
              :params="{
                values: col.filterParams?.values,
                cellRenderer: col.filterParams?.cellRenderer,
                cellRendererParams: col.filterParams?.cellRendererParams,
                targetFilterType: col.filterParams?.targetFilterType,
              }"
            />
          </template>
          <template v-else-if="col.filter === 'agMultiColumnFilter'">
            <DatePicker
              v-model="filterModel.value"
              date-format="dd/mm/yy"
              placeholder="jj/mm/aaaa"
            />
          </template>
          <template v-else-if="col.filter === 'agDateColumnFilter'">
            <DatePicker
              v-model="filterModel.value"
              date-format="dd/mm/yy"
              placeholder="jj/mm/aaaa"
            />
          </template>
          <template v-else-if="col.filter === 'agBooleanColumnFilter'">
            <PrimeSetFilter
              v-model="filterModel.value"
              :filter-callback="filterCallback"
              :params="{
                values: col.filterParams?.values,
                cellRenderer: col.filterParams?.valueFormatter,
              }"
            />
          </template>
          <template v-else-if="filterModel.matchMode === 'blank' || filterModel.matchMode === 'notBlank'">
            {{ dealWithBlankAndNotBlank(filterModel) }}
          </template>
          <DsfrInput
            v-else
            v-model="filterModel.value"
            type="text"
            class="p-inputtext p-component p-element"
            @update:model-value="filterCallback()"
          />
        </template>
      </Column>
      <template #paginatorcontainer="">
        <div class="flex justify-end items-center">
          <DsfrSelect
            v-model.number="perPage"
            title="Résultats par page"
            aria-label="Résultats par page"
            :options="[20, 50, 100]"
            default-unselected-text="Résultats par page"
          />
          <div class="mx-4">
            <template v-if="totalRecords > 0">
              {{ perPage * (currentPage - 1) + 1 }} à {{ Math.min(currentPage * perPage, totalRecords) }} de
              {{ totalRecords }}
            </template>
            <template v-else>
              Aucun résultat
            </template>
          </div>
          <DsfrPagination
            :current-page="currentPage - 1"
            :pages="paginationPages"
            @update:current-page="getRows($event + 1, 'initial')"
          />
        </div>
      </template>
    </DataTable>
    <div class="side-buttons">
      <div class="relative">
        <!--  TODO: Fonctionnalité de re-ordonnage et de re-taillage des colonnes. En attente du métier -->
        <!--        <div class="mb-2"> -->
        <!--          <button -->
        <!--            type="button" -->
        <!--            title="Réinitialiser les largeurs des colonnes" -->
        <!--            @click.stop="resetColumnsWidth()" -->
        <!--          > -->
        <!--            <div class="side-button-label"> -->
        <!--              Largeurs -->
        <!--            </div> -->
        <!--          </button> -->
        <!--        </div> -->
        <!--        <div class="mb-2"> -->
        <!--          <button -->
        <!--            type="button" -->
        <!--            title="Réinitialiser l'ordre des colonnes" -->
        <!--            @click.stop="resetColumnOrder()" -->
        <!--          > -->
        <!--            <div class="side-button-label"> -->
        <!--              Ordre -->
        <!--            </div> -->
        <!--          </button> -->
        <!--        </div> -->
        <button
          type="button"
          @click.stop="displayColumns = !displayColumns"
        >
          <div class="side-button-label">
            Sélection des Colonnes
          </div>
        </button>
      </div>
      <DataTableColumnList
        v-show="displayColumns"
        v-model="selectedColumnIds"
        class="table-column-list-container"
        :style="{ right: `${rightOffset}px` }"
        :column-defs="columnDefsForList"
        @close="displayColumns = false"
      />
    </div>
  </div>
</template>

<style scoped>
.side-buttons {
  position: absolute;
  right: 0;
  top: 45px;
  bottom: 45px;
}

/* ton panel */
.table-column-list-container {
  z-index: 1;
  border-left: 4px solid #f0f0f0;
  background: white;
  position: absolute;
  top: 0;
  right: unset;
  width: 300px;
  bottom: 0;
  max-height: none;

  padding: 20px;
  overflow: auto;
}

.side-button-label {
  writing-mode: vertical-lr;
  height: 300px;
}

:deep(.fr-pagination__link) {
  margin-bottom: 0;
}

.loading :deep(.p-datatable-tbody) {
  filter: blur(2px);
}

:deep(.p-paginator .fr-select) {
  margin: 0;
}

:deep(.p-paginator .fr-select-group) {
  max-width: 6rem;
  margin-bottom: 0;
}

:deep(.amount-line-highlighted) {
  background-color: var(--blue-ecume-975-75);
}

:deep(.p-datatable-table) {
  table-layout: fixed;
}

/* ========= chargement loading data table ========== */
:deep(.p-datatable) {
  position: relative;
}

:deep(.p-datatable-mask) {
  background: rgba(255, 255, 255, 0.45) !important;

  /* on écrase toute contrainte PrimeVue */
  height: auto !important;
  max-height: none !important;

  inset: 46px 0 50px 0 !important;

  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

:deep(.p-datatable-loading-icon),
:deep(.p-datatable-loading-overlay .p-icon) {
  display: none !important;
}

.bn-loadwrap{
  display:flex;
  flex-direction:column;
  gap:10px;
  align-items:center;
  justify-content:center;
  padding:16px 18px;
  background:rgba(255,255,255,.9);
  border:1px solid var(--grey-925-125);
  border-radius:12px;
  box-shadow:0 8px 24px rgba(0,0,0,.08);
}

.bn-logo{
  width:54px;
  height:54px;
  border-radius:50%;
  background: conic-gradient(
    var(--blue-france-sun-113-625) var(--p),
    #e5e7eb 0
  );
  display:grid;
  place-items:center;
}

.bn-logo::after{
  content:"";
  width:42px;height:42px;border-radius:50%;
  background:white;
  border:1px solid var(--grey-925-125);
}

.bn-loadtext{
  font-size:14px;
  color:var(--grey-200-850);
  text-align:center;
}

.bn-dots{
  display:inline-block;
  animation: bnDots 1.2s steps(4,end) infinite;
}
@keyframes bnDots{
  0%{opacity:.2}
  50%{opacity:1}
  100%{opacity:.2}
}

.bn-refresh{
  position:absolute;
  top:54px;             /* ajuste */
  right: calc(var(--rightOffset, 38px) + 12px);
  z-index: 5;
  font-size: 12px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255,255,255,.9);
  border: 1px solid var(--grey-925-125);
  box-shadow: 0 6px 18px rgba(0,0,0,.08);
  display:flex;
  align-items:center;
  gap:8px;
}

.bn-refresh__dot{
  width:10px;height:10px;border-radius:50%;
  background: var(--blue-france-sun-113-625);
  opacity:.7;
  animation: bnPulse 1s ease-in-out infinite;
}
@keyframes bnPulse{
  0%,100%{ transform:scale(.85); opacity:.5 }
  50%{ transform:scale(1.05); opacity:.9 }
}
</style>
