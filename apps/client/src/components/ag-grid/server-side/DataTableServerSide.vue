<script lang="ts" setup generic="T extends DynamicKeys">
import type { DataTableFilterMeta, DataTableFilterMetaData, DataTableOperatorFilterMetaData, DataTableSortEvent } from 'primevue/datatable'

import type { DynamicKeys, IPagination, IFilter } from '@biblio-num/shared'
import type { ApiCall } from './pagination.utils'

import type { BNColDef } from '@/components/ag-grid/server-side/bn-col-def.interface'
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

//#region 📍------ PROPS ------ 📍

export type DataTableClickEventType<T> = {
  data: T,
  column?: BNColDef,
  field?: string
}

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
  rowClick: [event: { data: T, column?: BNColDef, field?: string }]
}>()

//#endregion

const agGridFilterToDataTableFilter: Record<string, string> = {
  'agTextColumnFilter': FilterMatchMode.STARTS_WITH,
  'agNumberColumnFilter': FilterMatchMode.EQUALS,
  'agMultiColumnFilter': FilterMatchMode.DATE_IS,
  'agDateColumnFilter': FilterMatchMode.DATE_IS,
  'agSetColumnFilter': FilterMatchMode.IN,
  'agBooleanColumnFilter': FilterMatchMode.IN,
  'customNumbersFilter': FilterMatchMode.EQUALS,
  'customStringsFilter': FilterMatchMode.EQUALS,
}

const agGridFilterToDataTableDataType: Record<string, string | undefined> = {
  'agTextColumnFilter': undefined,
  'agNumberColumnFilter': 'numeric',
  'agMultiColumnFilter': 'date',
  'agDateColumnFilter': 'date',
  'agSetColumnFilter': 'set',
  'agBooleanColumnFilter': 'set',
  'customNumbersFilter': undefined,
  'customStringsFilter': undefined,
}

const dateMatchModeToAgGrid: Record<string, string> = {
  [FilterMatchMode.DATE_IS]: 'equals',
  [FilterMatchMode.DATE_IS_NOT]: 'notEqual',
  [FilterMatchMode.DATE_BEFORE]: 'lessThan',
  [FilterMatchMode.DATE_AFTER]: 'greaterThan',
}

const formatDateForApi = (value: Date | string | null): string | null => {
  if (!value) {
    return null
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day} 00:00:00`
}

const safeNumber = (val: any): number | null => {
  if (val === null || val === undefined || val === '') {
    return null
  }
  const num = Number(val)
  return Number.isNaN(num) ? null : num
}

const displayColumns = ref(false)
const perPage = ref(20)
const isLoadingRows = ref(false)
const tableKey = ref(0)

//#region 📍------ DATA ------ 📍
const currentPage = ref(1)
const rowData = ref()

const selectedColumnsIds = ref(props.columnDefs.filter((col) => !col.hide).map((col) => col.field ?? ''))

const totalRecords = ref(0)

const filteredColumnDefs = computed(() => {
  // Obtenir les colonnes non cachées et sélectionnées
  const availableColumns = props.columnDefs.filter((col) => {
    const isNotHidden = !col.hide
    const isSelected = selectedColumnsIds.value.includes(col.field ?? '')
    return isNotHidden && isSelected
  })

  // Si aucun ordre personnalisé n'est défini OU si l'ordre est vide, retourner l'ordre original
  if (columnsOrder.value.length === 0 || !columnsOrder.value.some(fieldId => availableColumns.some(col => col.field === fieldId))) {
    // Retourner dans l'ordre défini par props.columnDefs (ordre par défaut)
    return props.columnDefs.filter(col => {
      const isNotHidden = !col.hide
      const isSelected = selectedColumnsIds.value.includes(col.field ?? '')
      return isNotHidden && isSelected
    })
  }

  // Créer un map pour un accès rapide aux colonnes par field
  const columnMap = new Map(availableColumns.map(col => [col.field, col]))

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

const sort = ref<{ key: string; order: 'ASC' | 'DESC' }[]>([])
const filters = ref<DataTableFilterMeta>(getFilters())
const columnsWidth = ref<Record<string, number>>({})
const columnsOrder = ref<string[]>(props.columnDefs.filter((col) => !col.hide).map((col) => col.field ?? ''))

function getFilters () {
  return props.columnDefs
    .filter(col => col.filterable !== false) // Ne créer des filtres que pour les colonnes filtrables
    .reduce(
      (acc, col) => {
        return {
          ...acc,
          [col.field!]: {
            operator: FilterOperator.AND,
            constraints: [{
              value: null,
              matchMode: agGridFilterToDataTableFilter[col.filter || 'agTextColumnFilter'],
            }],
            fieldType: col.fieldType,
            filterType: agGridFilterToDataTableDataType[col.filter || 'agTextColumnFilter'],
          },
        }
      },
      {} as DataTableFilterMeta,
    )
}

const notifyFilterChanged = () => {
  const activeFilters: DisplayActiveFilter[] = []

  for (const [colId, filter] of Object.entries(filters.value)) {
    if ('value' in (filter as DataTableFilterMetaData)) {
      const metaFilter = filter as DataTableFilterMetaData
      if (metaFilter.value !== null && metaFilter.value !== undefined) {
        const colDef = props.columnDefs.find(col => col.field === colId)
        const isSetFilter = colDef?.filter === 'agSetColumnFilter'

        if (isSetFilter) {
          // Pour les filtres de type "set", on extrait juste les codes
          const values = Array.isArray(metaFilter.value)
            ? metaFilter.value.map(item => item.code || item)
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
      const activeConstraints = metaFilter.constraints.filter(c => c.value !== null && c.value !== undefined)

      if (activeConstraints.length > 0) {
        const colDef = props.columnDefs.find(col => col.field === colId)
        const isSetFilter = colDef?.filter === 'agSetColumnFilter'

        if (isSetFilter && activeConstraints[0]) {
          // Pour les filtres de type "set", format simple
          const values = Array.isArray(activeConstraints[0].value)
            ? activeConstraints[0].value.map(item => item.code || item)
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

watch(filters, () => {
  notifyFilterChanged()
}, { deep: true })

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

function restoreFromLocalStorage () {
  // Priorité à initialState si fourni
  let dto: IPagination<T> | null = null

  if (props.initialState) {
    dto = props.initialState
  } else if (props.localStorageKey) {
    try {
      const saved = localStorage.getItem(props.localStorageKey)
      if (saved) {
        dto = JSON.parse(saved)
      }
    } catch (e) {
      console.warn('Erreur de restauration depuis localStorage', e)
    }
  }

  if (!dto) {
    return
  }

  //#region 📍------ RESTORE FILTERS ------ 📍
  if (dto.filters) {
    Object.entries(dto.filters).forEach(([key, value]) => {
      const colDef = props.columnDefs.find(col => col.field === key)
      const isSetFilter = colDef?.filter === 'agSetColumnFilter'

      if (isSetFilter && value.condition1?.filter) {
        // Pour les filtres de type "set", on recrée le format PrimeVue
        const filterValues = Array.isArray(value.condition1.filter)
          ? value.condition1.filter.map(code => ({ name: code, code }))
          : [{ name: value.condition1.filter, code: value.condition1.filter }]

        filters.value[key as keyof typeof filters.value] = {
          operator: FilterOperator.AND,
          constraints: [{
            value: filterValues,
            matchMode: FilterMatchMode.IN,
          }],
          filterType: agGridFilterToDataTableDataType[colDef.filter || 'agTextColumnFilter'],
        }
      } else {
        // Pour les autres filtres, format classique
        const condition1 = value.condition1 as any
        const condition2 = (value as any).condition2

        filters.value[key as keyof typeof filters.value] = {
          operator: FilterOperator.AND,
          constraints: [
            {
              value: condition1?.filter || null,
              matchMode: condition1?.type || FilterMatchMode.STARTS_WITH,
            },
            ...(condition2
              ? [{
                  value: condition2.filter,
                  matchMode: condition2.type,
                }]
              : []),
          ],
          filterType: agGridFilterToDataTableDataType[colDef.filter || 'agTextColumnFilter'],
        }
      }
    })
  }
  //#endregion

  //#region 📍------ RESTORE SORTS ------ 📍
  if (dto.sorts && dto.sorts.length > 0) {
    const sortItem = dto.sorts.at(0)
    if (sortItem) {
      sort.value = [{
        key: sortItem.key,
        order: sortItem.order,
      }]
    }
  } else {
    sort.value = []
  }
  //#endregion

  //#region 📍------ RESTORE COLUMNS ------ 📍
  if (dto.columns && dto.columns.length > 0) {
    // Filtrer les colonnes pour exclure celles qui sont cachées
    const availableColumns = props.columnDefs.filter(col => !col.hide).map(col => col.field ?? '')
    selectedColumnsIds.value = (dto.columns as string[]).filter(colId => availableColumns.includes(colId))
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
    const availableColumns = props.columnDefs.filter(col => !col.hide).map(col => col.field ?? '')
    const validOrder = (dto.columnsOrder as string[]).filter(colId => availableColumns.includes(colId))

    // Ajouter les colonnes manquantes à la fin si elles ne sont pas dans l'ordre sauvegardé
    const missingColumns = availableColumns.filter(col => !validOrder.includes(col))
    const finalOrder = [...validOrder, ...missingColumns]

    selectedColumnsIds.value = finalOrder
    columnsOrder.value = finalOrder
  }
  //#endregion

  currentPage.value = dto.page ?? 1
  perPage.value = dto.perPage ?? 20
}

const hasInitialDataLoaded = ref(false)

onMounted(() => {
  filters.value = getFilters()
  restoreFromLocalStorage()
  notifyFilterChanged()
})
//#endregion

const filtersToSend = computed<Record<keyof typeof props.columnDefs, IFilter>>(() => {
  const result: Record<string, IFilter> = {}

  for (const [key, filter] of Object.entries(filters.value)) {
    const colDef = props.columnDefs.find(col => col.field === key)
    const mappedType = colDef ? agGridFilterToDataTableDataType[colDef.filter || ''] : undefined
    const currentType = (filter as any).filterType || mappedType || 'text'

    const apiType = currentType === 'numeric' ? 'number' : currentType

    // Helper interne pour résoudre le nom de l'opérateur
    const resolveOperator = (mode: string) => {
      if (currentType === 'date') {
        return dateMatchModeToAgGrid[mode] || 'equals'
      }
      if (currentType === 'numeric') {
        return mode === FilterMatchMode.NOT_EQUALS ? 'notEqual' : mode
      }
      if (currentType === 'text') {
        return mode === FilterMatchMode.NOT_EQUALS ? 'notEqual' : mode
      }
      return mode
    }

    // Helper interne pour résoudre la valeur
    const resolveValue = (val: any) => {
      if (currentType === 'date') {
        return formatDateForApi(val)
      }
      if (currentType === 'numeric') {
        return safeNumber(val)
      }
      return val
    }

    // =========================================================
    // CAS 1 : Filtre Simple ('value' directe)
    // =========================================================
    if ('value' in (filter as DataTableFilterMetaData)) {
      const metaFilter = filter as DataTableFilterMetaData

      // Detection Custom Filter Simple
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
            type: (isArray || isBlankOrNotBlank) ? undefined : resolveOperator(metaFilter.matchMode as string),
            filter: isArray ? metaFilter.value.map(({ code }: { code: string }) => code) : resolveValue(metaFilter.value),
          },
        }
        continue
      }
    }

    // =========================================================
    // CAS 2 : Filtre avec Opérateur
    // =========================================================
    if ('operator' in (filter as DataTableOperatorFilterMetaData)) {
      const metaFilter = filter as DataTableOperatorFilterMetaData
      if (!metaFilter.constraints || !Array.isArray(metaFilter.constraints)) {
        continue
      }
      const constraints = metaFilter.constraints
      const firstConstraint = constraints[0]

      // 1. Custom Filter Imbriqué
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

      constraints.forEach(c => {
        if (c.matchMode === 'blank' || c.matchMode === 'notBlank') {
          c.value = c.matchMode
        }
      })

      const hasValue1 = constraints[0]?.value !== null && constraints[0]?.value !== undefined
      const hasValue2 = constraints[1]?.value !== null && constraints[1]?.value !== undefined

      if (hasValue1 || hasValue2) {
        const isSetFilter = Array.isArray(constraints[0]!.value)
        const finalType = isSetFilter ? 'set' : apiType

        const output: any = {
          filterType: finalType,
          operator: metaFilter.operator === FilterOperator.AND ? 'AND' : 'OR',
          condition1: {
            filterType: finalType,
            type: isSetFilter ? undefined : resolveOperator(constraints[0]!.matchMode as string),
            filter: isSetFilter
              ? constraints[0]!.value.map((v: any) => v.code || v)
              : resolveValue(constraints[0]!.value),
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

      /* if (metaFilter.constraints.length === 2) {
        const [cond1, cond2] = metaFilter.constraints
        const isBlankOrNotBlank1 = cond1!.matchMode === 'blank' || cond1!.matchMode === 'notBlank'
        const isBlankOrNotBlank2 = cond2!.matchMode === 'blank' || cond2!.matchMode === 'notBlank'
        if (isBlankOrNotBlank1) {
          metaFilter.constraints.at(0)!.value = metaFilter.constraints.at(0)!.matchMode
        }
        if (isBlankOrNotBlank2) {
          metaFilter.constraints.at(1)!.value = metaFilter.constraints.at(1)!.matchMode
        }
        if (cond1?.value || cond2?.value) {
          result[key] = {
            filterType: apiType,
            condition1: {
              filterType: apiType,
              type: (Array.isArray(cond1!.value) || isBlankOrNotBlank1) ? undefined : resolveOperator(cond1!.matchMode as string),
              filter: resolveValue(cond1!.value),
            },
            condition2: {
              filterType: apiType,
              type: (Array.isArray(cond2!.value) || isBlankOrNotBlank2) ? undefined : resolveOperator(cond2!.matchMode as string),
              filter: Array.isArray(cond2!.value) ? cond2!.value.map(({ code }) => code) : cond2!.value,
            },
            operator: metaFilter.operator === FilterOperator.AND ? 'AND' : 'OR',
          }
        }
      } else if (metaFilter.constraints.length === 1) {
        const [cond1] = metaFilter.constraints
        const isBlankOrNotBlank1 = cond1!.matchMode === 'blank' || cond1!.matchMode === 'notBlank'
        if (isBlankOrNotBlank1) {
          cond1!.value = cond1!.matchMode
        }
        if (cond1!.value) {
          // const type = metaFilter.filterType || 'text'

          // @ts-expect-error TS2322
          result[key] = {
            filterType: Array.isArray(cond1!.value) ? 'set' : apiType,
            condition1: {
              type: Array.isArray(cond1!.value) ? undefined : resolveOperator(cond1!.matchMode as string),
              filter: Array.isArray(cond1!.value) ? cond1!.value.map(({ code }) => code) : (apiType === 'number' ? +cond1!.value : cond1!.value),
            },
          }
        }
      } */
    }
  }
  return result as Record<keyof typeof props.columnDefs, IFilter>
})

const getRows = async (page: number = currentPage.value) => {
  isLoadingRows.value = true

  const dto: IPagination<T> = {
    sorts: sort.value,
    filters: Object.keys(filtersToSend.value ?? {}).length > 0 ? filtersToSend.value as Record<keyof T, IFilter> : null,
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

watch(filtersToSend, () => {
  if (hasInitialDataLoaded.value) {
    getRows(1)
  }
})

// Watcher pour le premier chargement - attend que preCondition soit true ET que l'apiCall soit défini
watch(() => [props.preCondition, props.apiCall], ([preCondition, apiCall]) => {
  if (preCondition && apiCall && !hasInitialDataLoaded.value) {
    hasInitialDataLoaded.value = true
    getRows(currentPage.value)
  }
}, { immediate: true })

function onSortChanged (sortEvent: DataTableSortEvent) {
  const { sortField, sortOrder } = sortEvent
  const isSorted = sortField !== null && sortOrder !== null
  sort.value = isSorted ? [{ key: sortField as string, order: sortOrder === 1 ? 'ASC' : 'DESC' }] : []
  getRows(1)
}
//#endregion

watch(perPage, () => getRows(1))

// Watcher pour mettre à jour paginationDto quand les colonnes sélectionnées changent
watch(selectedColumnsIds, () => {
  if (hasInitialDataLoaded.value) {
    const dto: IPagination<T> = {
      sorts: sort.value,
      filters: Object.keys(filtersToSend.value ?? {}).length > 0 ? filtersToSend.value as Record<keyof T, IFilter> : null,
      columns: selectedColumnsIds.value,
      columnsWidth: columnsWidth.value as Record<string | keyof T, number>,
      columnsOrder: columnsOrder.value,
      perPage: +perPage.value,
      page: currentPage.value,
    }
    emit('update:paginationDto', dto)
  }
}, { deep: true })

const paginationPages = computed(
  () => Array.from(Array(Math.ceil(totalRecords.value / perPage.value)))
    .map((_, i) => ({ title: (i + 1).toString(), href: `#${i + 1}`, label: (i + 1).toString() })),
)

const onColResize = (event: { element: HTMLElement, delta: number }) => {
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
      filters: Object.keys(filtersToSend.value ?? {}).length > 0 ? filtersToSend.value as Record<keyof T, IFilter> : null,
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

const onColumnReorder = (event: { dragIndex: number, dropIndex: number }) => {
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
      filters: Object.keys(filtersToSend.value ?? {}).length > 0 ? filtersToSend.value as Record<keyof T, IFilter> : null,
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
const scrollHeight = ref('')
const dataTableRef = useTemplateRef('dataTable')
const computeScrollHeight = () => {
  const height = window.innerHeight
  const top = (dataTableRef.value)?.offsetTop || 0
  scrollHeight.value = `${height - top - 82}px`
}

onMounted(() => {
  setTimeout(() => {
    computeScrollHeight()
  }, 250)
})

useEventListener(window, 'resize', computeScrollHeight)
//#endregion

//#region 📍------ ROW CLICK ------ 📍
const onRowClick = (event: { data: T, originalEvent?: Event }) => {
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

function dealWithBlankAndNotBlank (filterModel: { matchMode: unknown, value: unknown }) {
  if (filterModel.matchMode === 'blank' || filterModel.matchMode === 'notBlank') {
    filterModel.value = filterModel.matchMode
  }
}

function refreshTable () {
  getRows(currentPage.value)
}

function clearAllFilters () {
  filters.value = getFilters()
  getRows(1)
  notifyFilterChanged()
}

function removeFilter (colId: string): Promise<void> {
  return new Promise((resolve) => {
    if (filters.value[colId]) {
      delete filters.value[colId]
      // Recréer les filtres pour inclure uniquement ceux qui restent
      const newFilters: DataTableFilterMeta = {}
      for (const [key, value] of Object.entries(filters.value)) {
        newFilters[key] = value
      }
      filters.value = newFilters
      getRows(1)
      notifyFilterChanged()
    }
    resolve()
  })
}

// Met à jour l'état du tableau de données en fonction du DTO fourni
function updateDataTableState (dto: IPagination<T>) {
  // Appliquer les filtres
  filters.value = getFilters()
  if (dto.filters) {
    Object.entries(dto.filters).forEach(([key, value]) => {
      const colDef = props.columnDefs.find(col => col.field === key)
      const isSetFilter = colDef?.filter === 'agSetColumnFilter'

      if (isSetFilter && value.condition1?.filter) {
        // Pour les filtres de type "set", on recrée le format PrimeVue
        const filterValues = Array.isArray(value.condition1.filter)
          ? value.condition1.filter.map(code => ({ name: code, code }))
          : [{ name: value.condition1.filter, code: value.condition1.filter }]

        filters.value[key as keyof typeof filters.value] = {
          ...(filters.value[key as keyof typeof filters.value] as DataTableOperatorFilterMetaData),
          operator: FilterOperator.AND,
          constraints: [{
            value: filterValues,
            matchMode: FilterMatchMode.IN,
          }],
        }
      } else {
        // Pour les autres filtres, format classique
        const condition1 = value.condition1 as any
        const condition2 = (value as any).condition2

        filters.value[key as keyof typeof filters.value] = {
          ...(filters.value[key as keyof typeof filters.value] as DataTableOperatorFilterMetaData),
          operator: FilterOperator.AND,
          constraints: [
            {
              value: condition1?.filter || null,
              matchMode: condition1?.type || FilterMatchMode.STARTS_WITH,
            },
            ...(condition2
              ? [{
                  value: condition2.filter,
                  matchMode: condition2.type,
                }]
              : []),
          ],
        }
      }
    })
  }

  // Appliquer les tris
  if (dto.sorts && dto.sorts.length > 0) {
    const sortItem = dto.sorts.at(0)
    if (sortItem) {
      sort.value = [{
        key: sortItem.key,
        order: sortItem.order,
      }]
    }
  } else {
    sort.value = []
  }

  // Appliquer les colonnes visibles
  if (dto.columns) {
    // Filtrer les colonnes pour exclure celles qui sont cachées
    const availableColumns = props.columnDefs.filter(col => !col.hide).map(col => col.field ?? '')
    selectedColumnsIds.value = (dto.columns as string[]).filter(colId => availableColumns.includes(colId))
  }

  // Appliquer les largeurs de colonnes
  if (dto.columnsWidth) {
    columnsWidth.value = dto.columnsWidth as Record<string, number>
  }

  // Appliquer l'ordre des colonnes
  if (dto.columnsOrder && dto.columnsOrder.length > 0) {
    const availableColumns = props.columnDefs.filter(col => !col.hide).map(col => col.field ?? '')
    const validOrder = (dto.columnsOrder as string[]).filter(colId => availableColumns.includes(colId))

    // Ajouter les colonnes manquantes à la fin si elles ne sont pas dans l'ordre sauvegardé
    const missingColumns = availableColumns.filter(col => !validOrder.includes(col))
    const finalOrder = [...validOrder, ...missingColumns]

    selectedColumnsIds.value = finalOrder
    columnsOrder.value = finalOrder
  }

  selectedColumnsIds.value = selectedColumnsIds.value.filter(colId => dto.columns.includes(colId))

  // Appliquer la pagination
  currentPage.value = dto.page ?? 1
  perPage.value = dto.perPage ?? 20

  // Notifier les changements et rafraîchir
  notifyFilterChanged()
  refreshTable()
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
    const realOrder = filteredColumnDefs.value.map(col => col.field)
    console.warn('Column order reset completed. New order:', toRaw(columnsOrder.value))
    console.warn('filteredColumnDefs order:', realOrder)
    // Sauvegarder immédiatement la réinitialisation
    if (hasInitialDataLoaded.value) {
      const dto: IPagination<T> = {
        sorts: sort.value,
        filters: Object.keys(filtersToSend.value ?? {}).length > 0 ? filtersToSend.value as Record<keyof T, IFilter> : null,
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
      filters: Object.keys(filtersToSend.value ?? {}).length > 0 ? filtersToSend.value as Record<keyof T, IFilter> : null,
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
      :style="{ width: `calc(100vw - ${rightOffset}px)` }"
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
      :first="0"
      :scroll-height="scrollHeight"
      filter-display="menu"
      row-hover
      :sort-field="sort[0]?.key"
      :sort-order="sort[0]?.order === 'ASC' ? 1 : (sort[0]?.order === 'DESC' ? -1 : 0)"
      @column-resize-end="onColResize($event)"
      @column-reorder="onColumnReorder($event)"
      @sort="onSortChanged($event)"
      @row-click="onRowClick($event)"
    >
      <template #paginatorstart>
        <Button type="button" icon="pi pi-refresh" text />
      </template>
      <template #paginatorend>
        <Button type="button" icon="pi pi-download" text />
      </template>
      <Column
        v-for="col of filteredColumnDefs"
        :key="col.field"
        :field="col.field"
        :header="col.headerName"
        :show-filter-operator="false"
        :show-add-button="col.filter !== 'customStringsFilter'"
        :data-type="agGridFilterToDataTableDataType[col.filter]"
        :sortable="col.sortable === false ? undefined : true"
        :show-filter-match-modes="!['customNumbersFilter', 'customStringsFilter', 'agBooleanColumnFilter'].includes(col.filter)"
        :show-filter-menu="!col.suppressHeaderMenuButton"
        :title="col.headerName"
      >
        <template #body="{ data }">
          <template v-if="col.cellRenderer">
            <component :is="col.cellRenderer" :style="col.cellStyle" :params="{ row: data, value: data[col.field!], ...col.cellRendererParams }" />
          </template>
          <template v-else-if="col.valueFormatter && typeof col.valueFormatter === 'function' && col.field">
            <span :style="(col.cellStyle as unknown as string)">
              {{ col.valueFormatter({ value: data[col.field] } as any) }}
            </span>
          </template>
          <template v-else>
            <span :style="(col.cellStyle as unknown as string)">
              {{ data[col.field!] }}
            </span>
          </template>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <template v-if="col.filter === 'agSetColumnFilter'">
            <MultiSelect
              v-model="filterModel.value"
              :options="col.filterParams.values.map(
                (value: string) => ({ name: col.filterParams.valueFormatter ? col.filterParams.valueFormatter({ value }) : value, code: value }),
              )"
              option-label="name"
              placeholder="Toutes les valeurs"
              @change="filterCallback()"
            >
              <template #option="slotProps">
                <component :is="col.filterParams.cellRenderer ?? col.cellRenderer" :params="{ value: slotProps.option.name }" />
              </template>
            </MultiSelect>
          </template>
          <template v-else-if="col.filter === 'agMultiColumnFilter'">
            <DatePicker v-model="filterModel.value" date-format="dd/mm/yy" placeholder="jj/mm/aaaa" />
          </template>
          <template v-else-if="col.filter === 'customNumbersFilter'">
            <PrimeNumbersFilter
              v-model="filterModel.value"
              :filter-callback="filterCallback"
              :params="col.filterParams"
            />
          </template>
          <template v-else-if="col.filter === 'customStringsFilter'">
            <PrimeStringListFilter
              v-model="filterModel.value"
              :filter-callback="filterCallback"
              :params="col.filterParams"
            />
          </template>
          <template v-else-if="col.filter === 'agDateColumnFilter'">
            <DatePicker v-model="filterModel.value" date-format="mm/dd/yy" placeholder="mm/dd/yyyy" />
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
          <template
            v-else-if="filterModel.matchMode === 'blank' || filterModel.matchMode === 'notBlank'"
          >
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
        <button type="button" @click.stop="displayColumns = !displayColumns">
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
  margin-bottom: 0;;
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

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}

:deep(.p-datatable, .p-datatable p, .p-datatable-filter-operator) {
  font-size: 0.875rem !important;
}

:deep(.p-datatable-thead > tr > th span) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0; /* Important pour permettre le rétrécissement */
}

:deep(.p-datatable-thead > tr > th .p-column-header-content span) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block; /* Force l'élément à être un bloc */
  min-width: 0; /* Important pour permettre le rétrécissement */
}

:deep(.p-datatable-thead > tr > th .p-column-title span) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  min-width: 0;
}

:deep(.p-datatable-resizable-table > .p-datatable-tbody > tr > td) {
  vertical-align: middle;
  & p:not(.fr-badge) {
    margin-block: 0.125rem 0.25rem !important;
    font-size: 0.875rem !important;
  }
}

:deep(.amount-line-highlighted) {
  background-color: var(--blue-ecume-975-75);
}
</style>
