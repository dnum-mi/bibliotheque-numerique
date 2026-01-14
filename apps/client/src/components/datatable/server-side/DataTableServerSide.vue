<script lang="ts" setup generic="T extends DynamicKeys">
import type { DataTableFilterMeta, DataTableFilterMetaData, DataTableOperatorFilterMetaData, DataTableSortEvent } from 'primevue/datatable'
import type { DynamicKeys, IPagination, IFilter } from '@biblio-num/shared'
import type { ApiCall } from './filters.utils'
import type { BNColDef } from '@/components/datatable/server-side/bn-col-def.interface'
import type { DisplayActiveFilter } from '../active-filters/activeFilters.type'

import { useDebounceFn, useEventListener } from '@vueuse/core'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import { nextTick, toRaw } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import MultiSelect from 'primevue/multiselect'
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

//#region 📍------ PROPS ------ 📍
type SortItem = { key: string; order: 'ASC' | 'DESC' }

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

//#endregion

//#region 📍------ EVENTS ------ 📍

const emit = defineEmits<{
  'update:paginationDto': [p: IPagination<T>]
  filtersUpdated: [filters: DisplayActiveFilter[]]
  rowClick: [event: { data: T; column?: BNColDef; field?: string }]
}>()

//#endregion

//#region 📍------ STATE ------ 📍

const isLoadingRows = ref(false)
const tableKey = ref(0)
const displayColumns = ref(false)

const currentPage = ref(1)
const perPage = ref(20)
const totalRecords = ref(0)
const rowData = ref()

const selectedColumnsIds = ref(props.columnDefs.filter((col) => !col.hide).map((col) => col.field ?? ''))
const columnsOrder = ref<string[]>(props.columnDefs.filter((col) => !col.hide).map((col) => col.field ?? ''))
const columnsWidth = ref<Record<string, number>>({})
const sort = ref<SortItem[]>([])

const filters = ref<DataTableFilterMeta>(getFilters(props.columnDefs))

const isReadyToWatch = ref(false)
const hasInitialDataLoaded = ref(false)

//#endregion

//#region 📍------ DATA ------ 📍

const filteredColumnDefs = computed(() => {
  // Obtenir les colonnes non cachées et sélectionnées
  const availableColumns = props.columnDefs.filter((col) => {
    const isNotHidden = !col.hide
    const isSelected = selectedColumnsIds.value.includes(col.field ?? '')
    return isNotHidden && isSelected
  })

  // Si aucun ordre personnalisé n'est défini OU si l'ordre est vide, retourner l'ordre original
  if (columnsOrder.value.length === 0 || !columnsOrder.value.some((fieldId) => availableColumns.some((col) => col.field === fieldId))) {
    // Retourner dans l'ordre défini par props.columnDefs (ordre par défaut)
    return props.columnDefs.filter((col) => {
      const isNotHidden = !col.hide
      const isSelected = selectedColumnsIds.value.includes(col.field ?? '')
      return isNotHidden && isSelected
    })
  }

  // Créer un map pour un accès rapide aux colonnes par field
  const columnMap = new Map(availableColumns.map((col) => [col.field, col]))

  // Réorganiser selon l'ordre défini dans columnsOrder
  const orderedColumns = []

  // Ajouter les colonnes dans l'ordre spécifié
  for (const fieldId of columnsOrder.value) {
    const column = columnMap.get(fieldId)
    if (column) {
      orderedColumns.push(column)
      columnMap.delete(fieldId) // Retirer pour éviter les doublons
    }
  }

  // Ajouter les colonnes restantes qui ne sont pas dans l'ordre personnalisé
  orderedColumns.push(...columnMap.values())

  return orderedColumns
})

//#endregion

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
          // Pour les filtres de type "set", on extrait juste les codes
          const values = Array.isArray(metaFilter.value)
            ? metaFilter.value.map((item) => item.code || item)
            : [metaFilter.value]

          activeFilters.push({
            colId,
            filterType: 'set',
            values,
          } as DisplayActiveFilter)
        } else {
          // Pour les autres filtres, format simple
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
          // Pour les filtres de type "set", format simple
          const values = Array.isArray(activeConstraints[0].value)
            ? activeConstraints[0].value.map((item) => item.code || item)
            : [activeConstraints[0].value]

          activeFilters.push({
            colId,
            filterType: 'set',
            values,
          } as DisplayActiveFilter)
        } else {
          // Pour les autres filtres, on peut garder condition1/condition2 si nécessaire
          const filterData: DisplayActiveFilter = {
            colId,
            filterType: 'text',
            values: [],
          }

          if (activeConstraints.length === 1 && activeConstraints[0]) {
            filterData.type = activeConstraints[0].matchMode
            filterData.filter = activeConstraints[0].value
          } else if (activeConstraints.length >= 2 && activeConstraints[0] && activeConstraints[1]) {
            filterData.operator = metaFilter.operator as 'AND' | 'OR'
            filterData.condition1 = {
              type: activeConstraints[0].matchMode,
              filter: activeConstraints[0].value,
            }
            filterData.condition2 = {
              type: activeConstraints[1].matchMode,
              filter: activeConstraints[1].value,
            }
          }

          activeFilters.push(filterData)
        }
      }
    }
  }

  emit('filtersUpdated', activeFilters)
}

//#region 📍------ LOCAL STORAGE ------ 📍
const saveToLocalStorage = (dto: IPagination<T>) => {
  if (!props.localStorageKey) {
    return
  }
  try {
    const data = JSON.stringify(dto)
    localStorage.setItem(`${props.localStorageKey}`, data)
  } catch (e) {
    console.warn('Erreur de sauvegarde dans localStorage', e)
  }
}

const applyFromDto = (dto: IPagination<T>) => {
  //#region 📍------ RESTORE FILTERS ------ 📍
  if (dto.filters) {
    const rebuiltFilters = getFilters(props.columnDefs)

    Object.entries(dto.filters).forEach(([key, savedValue]) => {
      const colDef = props.columnDefs.find((c) => c.field === key)
      if (!colDef) {
        return
      }

      const filterName = typeof colDef.filter === 'string' ? colDef.filter : 'agTextColumnFilter'

      // Détection précise du type
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
          valueToRestore = {
            filterType: 'set',
            includeEmpty: false,
            filter: cond1.filter,
          }
        } else if (cond1.filter !== undefined) {
          valueToRestore = {
            filterType: 'set',
            includeEmpty: false,
            filter: [cond1.filter],
          }
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

        const selectedOptions = booleanOptions.filter(opt => rawValues.includes(opt.code))

        rebuiltFilters[key] = {
          operator: FilterOperator.AND,
          constraints: [{
            value: selectedOptions,
            matchMode: FilterMatchMode.IN,
          }],
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
  //#endregion

  //#region 📍------ RESTORE SORTS ------ 📍
  if (dto.sorts && dto.sorts.length > 0) {
    const sortItem = dto.sorts.at(0)
    if (sortItem) {
      sort.value = [
        {
          key: sortItem.key,
          order: sortItem.order,
        },
      ]
    }
  } else {
    sort.value = []
  }
  //#endregion

  //#region 📍------ RESTORE COLUMNS ------ 📍
  if (dto.columns && dto.columns.length > 0) {
    // Filtrer les colonnes pour exclure celles qui sont cachées
    const availableColumns = props.columnDefs.filter((col) => !col.hide).map((col) => col.field ?? '')
    selectedColumnsIds.value = (dto.columns as string[]).filter((colId) => availableColumns.includes(colId))
  }
  //#endregion

  //#region 📍------ RESTORE COLUMNS WIDTH ------ 📍
  if (dto.columnsWidth) {
    columnsWidth.value = dto.columnsWidth as Record<string, number>
    tableKey.value++
  }
  //#endregion

  //#region 📍------ RESTORE COLUMNS ORDER ------ 📍
  if (dto.columnsOrder && dto.columnsOrder.length > 0) {
    const availableColumns = props.columnDefs.filter((col) => !col.hide).map((col) => col.field ?? '')
    const validOrder = (dto.columnsOrder as string[]).filter((colId) => availableColumns.includes(colId))

    // Ajouter les colonnes manquantes à la fin si elles ne sont pas dans l'ordre sauvegardé
    const missingColumns = availableColumns.filter((col) => !validOrder.includes(col))
    const finalOrder = [...validOrder, ...missingColumns]

    selectedColumnsIds.value = finalOrder
    columnsOrder.value = finalOrder
  }
  //#endregion

  currentPage.value = dto.page ?? 1
  perPage.value = dto.perPage ?? 20
}

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

        // On construit la structure imbriquée attendue par le backend
        result[key] = {
          filterType: customValue.filterType,
          condition1: customValue,
        }
        continue
      }

      // 2. Gestion Date (Spécifique car besoin de filterTo)
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

const getRows = async (page: number = currentPage.value) => {
  isLoadingRows.value = true

  const dto: IPagination<T> = {
    sorts: sort.value,
    filters: Object.keys(filtersToSend.value ?? {}).length > 0 ? (filtersToSend.value as Record<keyof T, IFilter>) : null,
    columns: selectedColumnsIds.value,
    columnsWidth: columnsWidth.value as Record<string | keyof T, number>,
    columnsOrder: columnsOrder.value,
    perPage: +perPage.value,
    page,
  }
  emit('update:paginationDto', dto)
  saveToLocalStorage(dto)

  try {
    const response = await props.apiCall(dto)
    currentPage.value = page
    // params.success({ rowData: response.data, rowCount: response.total })
    rowData.value = response.data
    totalRecords.value = response.total
  } finally {
    isLoadingRows.value = false
  }
}

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
    } catch (e) { console.warn(e) }
  }

  if (startDto) {
    applyFromDto(startDto)
  }

  await nextTick()

  await getRows(currentPage.value)

  hasInitialDataLoaded.value = true

  isReadyToWatch.value = true
  notifyFilterChanged()
}

function onSortChanged (sortEvent: DataTableSortEvent) {
  const { sortField, sortOrder } = sortEvent
  const isSorted = sortField !== null && sortOrder !== null
  sort.value = isSorted ? [{ key: sortField as string, order: sortOrder === 1 ? 'ASC' : 'DESC' }] : []
  getRows(1)
}
//#endregion

const paginationPages = computed(() =>
  Array.from(Array(Math.ceil(totalRecords.value / perPage.value))).map((_, i) => ({
    title: (i + 1).toString(),
    href: `#${i + 1}`,
    label: (i + 1).toString(),
  })),
)

const onColResize = (event: { element: HTMLElement; delta: number }) => {
  // Identifier la colonne concernée par le redimensionnement
  // L'élément est la cellule d'en-tête <th>, cherchons son attribut data-pc-section ou son index
  const headerElement = event.element as HTMLTableCellElement
  const table = headerElement.closest('table')
  if (!table) {
    return
  }

  // Trouver l'index de la colonne
  const headerRow = table.querySelector('thead tr')
  if (!headerRow) {
    return
  }

  const headers = Array.from(headerRow.querySelectorAll('th'))
  const columnIndex = headers.indexOf(headerElement)

  if (columnIndex === -1) {
    return
  }

  // Trouver le field correspondant à cette colonne
  const column = filteredColumnDefs.value[columnIndex]
  if (!column || !column.field) {
    return
  }

  const field = column.field as string
  const currentWidth = headerElement.offsetWidth

  // Mettre à jour les largeurs de colonnes

  columnsWidth.value = {
    ...columnsWidth.value,
    [field]: currentWidth,
  }

  // Sauvegarder immédiatement les largeurs modifiées
  if (hasInitialDataLoaded.value) {
    const dto: IPagination<T> = {
      sorts: sort.value,
      filters: Object.keys(filtersToSend.value ?? {}).length > 0 ? (filtersToSend.value as Record<keyof T, IFilter>) : null,
      columns: selectedColumnsIds.value,
      columnsWidth: columnsWidth.value as Record<string | keyof T, number>,
      columnsOrder: columnsOrder.value,
      perPage: +perPage.value,
      page: currentPage.value,
    }
    emit('update:paginationDto', dto)
    saveToLocalStorage(dto)
  }
}

const onColumnReorder = (event: { dragIndex: number; dropIndex: number }) => {
  // Créer une copie de l'ordre actuel des colonnes visibles
  const currentOrder = [...selectedColumnsIds.value]

  // Déplacer la colonne de dragIndex vers dropIndex
  const movedColumn = currentOrder.splice(event.dragIndex, 1)[0]
  if (movedColumn) {
    currentOrder.splice(event.dropIndex, 0, movedColumn)
  }

  // Mettre à jour l'ordre des colonnes
  selectedColumnsIds.value = currentOrder
  columnsOrder.value = currentOrder

  // Sauvegarder immédiatement l'ordre modifié
  if (hasInitialDataLoaded.value) {
    const dto: IPagination<T> = {
      sorts: sort.value,
      filters: Object.keys(filtersToSend.value ?? {}).length > 0 ? (filtersToSend.value as Record<keyof T, IFilter>) : null,
      columns: selectedColumnsIds.value,
      columnsWidth: columnsWidth.value as Record<string | keyof T, number>,
      columnsOrder: columnsOrder.value,
      perPage: +perPage.value,
      page: currentPage.value,
    }
    emit('update:paginationDto', dto)
    saveToLocalStorage(dto)
  }
}

//#region 📍------ SCROLL HEIGHT ------ 📍
const scrollHeight = ref('flex')
const dataTableRef = useTemplateRef('dataTable')

const computeScrollHeight = () => {
  if (!dataTableRef.value) {
    return
  }

  const height = window.innerHeight
  const top = dataTableRef.value.getBoundingClientRect().top + window.scrollY
  const offsetBottom = 82

  const newHeight = `${height - top - offsetBottom}px`

  if (scrollHeight.value !== newHeight) {
    scrollHeight.value = newHeight
  }
}

const debouncedCompute = useDebounceFn(computeScrollHeight, 100)

onMounted(() => {
  computeScrollHeight()
})

useEventListener(window, 'resize', debouncedCompute)

onUpdated(() => {
  computeScrollHeight()
})
//#endregion

//#region 📍------ ROW CLICK ------ 📍
const onRowClick = (event: { data: T; originalEvent?: Event }) => {
  // Extraire les informations de la ligne cliquée
  const rowData = event.data

  // Si nous voulons aussi des informations sur la colonne, nous pourrions les ajouter
  // Mais PrimeVue DataTable row-click ne fournit que les données de la ligne
  emit('rowClick', {
    data: rowData,
    // On pourrait ajouter d'autres métadonnées ici si nécessaire
  })
}
//#endregion

function refreshTable () {
  getRows(currentPage.value)
}

function clearAllFilters () {
  filters.value = getFilters(props.columnDefs)
  getRows(1)
  notifyFilterChanged()
}

function removeFilter (colId: string): Promise<void> {
  return new Promise((resolve) => {
    if (filters.value[colId]) {
      // On génère un jeu de filtres vierges
      const emptyFilters = getFilters(props.columnDefs)
      // On remplace le filtre actuel par sa version vierge
      // @ts-expect-error TS2322
      filters.value = {
        ...filters.value,
        // On restaure la structure { operator: ..., constraints: [...] }
        [colId]: emptyFilters[colId],
      }
      getRows(1)
      notifyFilterChanged()
    }
    resolve()
  })
}

// Met à jour l'état du tableau de données en fonction du DTO fourni
const updateDataTableState = (dto: IPagination<T>) => {
  applyFromDto(dto)
}

function resetColumnOrder () {
  // Réinitialiser l'ordre des colonnes à l'ordre par défaut, mais uniquement pour les colonnes actuellement visibles
  const defaultOrder = props.columnDefs
    .filter((col) => !col.hide && selectedColumnsIds.value.includes(col.field ?? ''))
    .map((col) => col.field ?? '')

  console.warn('Resetting column order to default (only visible columns):', defaultOrder)
  console.warn('Current selectedColumnsIds:', toRaw(selectedColumnsIds.value))
  console.warn('Current columnsOrder:', toRaw(columnsOrder.value))

  selectedColumnsIds.value = [...defaultOrder]
  columnsOrder.value = [...defaultOrder]
  tableKey.value++
  nextTick(() => {
    // Validation de l'ordre réel des colonnes
    const realOrder = filteredColumnDefs.value.map((col) => col.field)
    console.warn('Column order reset completed. New order:', toRaw(columnsOrder.value))
    console.warn('filteredColumnDefs order:', realOrder)
    // Sauvegarder immédiatement la réinitialisation
    if (hasInitialDataLoaded.value) {
      const dto: IPagination<T> = {
        sorts: sort.value,
        filters: Object.keys(filtersToSend.value ?? {}).length > 0 ? (filtersToSend.value as Record<keyof T, IFilter>) : null,
        columns: selectedColumnsIds.value,
        columnsWidth: columnsWidth.value as Record<string | keyof T, number>,
        columnsOrder: columnsOrder.value,
        perPage: +perPage.value,
        page: currentPage.value,
      }
      emit('update:paginationDto', dto)
      saveToLocalStorage(dto)
    }
  })
}

function resetColumnsWidth () {
  // Réinitialiser toutes les largeurs de colonnes
  console.warn('Resetting all column widths to default')
  columnsWidth.value = {}

  // Force le re-rendu du tableau en déclarant que les données ont changé
  tableKey.value++

  // Sauvegarder immédiatement la réinitialisation
  if (hasInitialDataLoaded.value) {
    const dto: IPagination<T> = {
      sorts: sort.value,
      filters: Object.keys(filtersToSend.value ?? {}).length > 0 ? (filtersToSend.value as Record<keyof T, IFilter>) : null,
      columns: selectedColumnsIds.value,
      columnsWidth: columnsWidth.value as Record<string | keyof T, number>,
      columnsOrder: columnsOrder.value,
      perPage: +perPage.value,
      page: currentPage.value,
    }
    emit('update:paginationDto', dto)
    saveToLocalStorage(dto)
  }
}

watch(
  filters,
  () => {
    notifyFilterChanged()
  },
  { deep: true },
)

watch(filtersToSend, () => {
  if (!isReadyToWatch.value) {
    return
  }

  if (hasInitialDataLoaded.value) {
    getRows(1)
  }
})

watch(perPage, () => {
  if (!isReadyToWatch.value) {
    return
  }
  getRows(1)
})

// Watcher pour mettre à jour paginationDto quand les colonnes sélectionnées changent
watch(
  selectedColumnsIds,
  () => {
    if (!isReadyToWatch.value) {
      return
    }

    if (hasInitialDataLoaded.value) {
      const dto: IPagination<T> = {
        sorts: sort.value,
        filters: Object.keys(filtersToSend.value ?? {}).length > 0 ? (filtersToSend.value as Record<keyof T, IFilter>) : null,
        columns: selectedColumnsIds.value,
        columnsWidth: columnsWidth.value as Record<string | keyof T, number>,
        columnsOrder: columnsOrder.value,
        perPage: +perPage.value,
        page: currentPage.value,
      }
      emit('update:paginationDto', dto)
    }
  },
  { deep: true },
)

// Watcher pour le premier chargement - attend que preCondition soit true ET que l'apiCall soit défini
watch(
  () => [props.preCondition, props.apiCall],
  ([preCondition, apiCall]) => {
    if (preCondition && apiCall) {
      initializeTable()
    }
  },
  { immediate: true },
)

const first = computed(() => (currentPage.value - 1) * perPage.value)
const onPage = (event: { first: number, rows: number }) => {
  if (totalRecords.value === 0 && isLoadingRows.value) {
    return
  }
  const newPage = Math.floor(event.first / event.rows) + 1
  if (currentPage.value !== newPage) {
    currentPage.value = newPage
  }
}

//#region 📍------ TEMPLATE HELPERS ------ 📍
/**
 * Retourne le type de données pour PrimeVue DataTable
 */
function getColumnDataType (col: BNColDef): string | undefined {
  if (typeof col.filter === 'string') {
    return serverFilterToDataTableDataType[col.filter]
  }
  return undefined
}

/**
 * Détermine si les contrôles de filtre (bouton add et match modes) doivent être affichés
 */
function shouldShowFilterControls (col: BNColDef): boolean {
  if (typeof col.filter === 'string') {
    return !SET_FILTER_TYPES.includes(col.filter as any)
  }
  return true
}
//#endregion

useAmountLines()

defineExpose({
  refresh: refreshTable,
  clearAllFilters,
  removeFilter,
  updateDataTableState,
  resetColumnOrder,
  resetColumnsWidth,
})
</script>

<template>
  <div
    ref="dataTable"
    class="h-full flex relative"
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
      :rows-per-page-options="[20, 50, 100]"
      :first="first"
      :total-records="totalRecords"
      :scroll-height="scrollHeight"
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
              date-format="mm/dd/yy"
              placeholder="mm/dd/yyyy"
            />
          </template>
          <template v-else-if="col.filter === 'agBooleanColumnFilter'">
            <MultiSelect
              v-model="filterModel.value"
              :options="[
                { name: 'Oui', code: 'true' },
                { name: 'Non', code: 'false' },
              ]"
              option-label="name"
              placeholder="Tous"
              :max-selected-labels="1"
              class="w-full"
              @change="filterCallback()"
            >
              <template #option="slotProps">
                <span>{{ slotProps.option.name }}</span>
              </template>
            </MultiSelect>
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
              {{ perPage * (currentPage - 1) + 1 }} à {{ Math.min(currentPage * perPage, totalRecords) }} de {{ totalRecords }}
            </template>
            <template v-else>
              Aucun résultat
            </template>
          </div>
          <DsfrPagination
            :current-page="currentPage - 1"
            :pages="paginationPages"
            @update:current-page="getRows($event + 1)"
          />
        </div>
      </template>
    </DataTable>
    <div class="side-buttons relative">
      <div class="relative">
        <div class="mb-2">
          <button
            type="button"
            title="Réinitialiser les largeurs des colonnes"
            @click.stop="resetColumnsWidth()"
          >
            <div class="side-button-label">
              Largeurs
            </div>
          </button>
        </div>
        <div class="mb-2">
          <button
            type="button"
            title="Réinitialiser l'ordre des colonnes"
            @click.stop="resetColumnOrder()"
          >
            <div class="side-button-label">
              Ordre
            </div>
          </button>
        </div>
        <button
          type="button"
          @click.stop="displayColumns = !displayColumns"
        >
          <div class="side-button-label">
            Colonnes
          </div>
        </button>
      </div>
      <DataTableColumnList
        v-show="displayColumns"
        v-model="selectedColumnsIds"
        class="column-list p-2 -translate-x-8 -top-2 right-0 -left-60 bottom-2 absolute bg-white"
        :column-defs="columnDefs"
        @close="displayColumns = false"
      />
    </div>
  </div>
</template>

<style scoped>
.column-list {
  z-index: 1;
  box-shadow: -6px 0 10px 0 #5558;
}

.side-button-label {
  writing-mode: vertical-lr;
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
</style>
