<script lang="ts" setup generic="T extends DynamicKeys">
import type { DataTableFilterMeta, DataTableFilterMetaData, DataTableOperatorFilterMetaData, DataTableSortEvent } from 'primevue/datatable'
import type { GridReadyEvent, SelectionChangedEvent } from 'ag-grid-community'
import type { GridOptions } from 'ag-grid-enterprise'

import type { DynamicKeys, IPagination, IFilter } from '@biblio-num/shared'
import type { ApiCall } from './pagination.utils'

import type { BNColDef } from '@/components/ag-grid/server-side/bn-col-def.interface'
import type { DisplayActiveFilter } from '../active-filters/activeFilters.type'

import { useEventListener } from '@vueuse/core'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import MultiSelect from 'primevue/multiselect'
import DatePicker from 'primevue/datepicker'
import { useAmountLines } from './useAmountLines'

//#region 📍------ PROPS ------ 📍

const props = withDefaults(
  defineProps<{
    paginationDto?: IPagination<T>
    columnDefs: BNColDef[]
    apiCall: ApiCall<T>
    onSelectionChanged: ($event: SelectionChangedEvent) => void
    loading?: boolean
    preCondition?: boolean
    specificGridOption?: Partial<GridOptions>
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
    specificGridOption: () => ({}),
    localStorageKey: undefined,
    initialState: null,
  },
)

//#endregion

//#region 📍------ EVENTS ------ 📍

const emit = defineEmits<{
  gridReady: [p: GridReadyEvent]
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
}

const agGridFilterToDataTableDataType: Record<string, string | undefined> = {
  'agTextColumnFilter': undefined,
  'agNumberColumnFilter': 'numeric',
  'agMultiColumnFilter': 'date',
  'agDateColumnFilter': 'date',
  'agSetColumnFilter': 'set',
}

const displayColumns = ref(false)
const perPage = ref(20)
const isLoadingRows = ref(false)

//#region 📍------ DATA ------ 📍
const currentPage = ref(1)
const rowData = ref()

const selectedColumnsIds = ref(props.columnDefs.filter((col) => !col.hide).map((col) => col.field ?? ''))

const totalRecords = ref(0)

const sort = ref<{ key: string; order: 'ASC' | 'DESC' }[]>([])
const filters = ref<DataTableFilterMeta>(getFilters())

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
    if ('value' in (filter as DataTableFilterMetaData)) {
      const metaFilter = filter as DataTableFilterMetaData
      const isBlankOrNotBlank = metaFilter.matchMode === 'blank' || metaFilter.matchMode === 'notBlank'
      if (isBlankOrNotBlank) {
        metaFilter.value = metaFilter.matchMode
      }
      if (metaFilter.value) {
        // @ts-expect-error TS2322
        result[key] = {
          filterType: Array.isArray(metaFilter.value) ? 'set' : 'text',
          condition1: {
            type: (Array.isArray(metaFilter.value) || isBlankOrNotBlank) ? undefined : metaFilter.matchMode,
            filter: Array.isArray(metaFilter.value) ? metaFilter.value.map(({ code }) => code) : metaFilter.value,
          },
        }
        continue
      }
    }
    if ('operator' in (filter as DataTableOperatorFilterMetaData)) {
      const metaFilter = filter as DataTableOperatorFilterMetaData
      if (metaFilter.constraints.length === 2) {
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
            filterType: Array.isArray(cond1!.value) ? 'set' : 'text',
            condition1: {
              type: (Array.isArray(cond1!.value) || isBlankOrNotBlank1) ? undefined : cond1!.matchMode,
              filter: Array.isArray(cond1!.value) ? cond1!.value.map(({ code }) => code) : cond1!.value,
            },
            condition2: {
              // @ts-expect-error TS2322 à corriger dans nos types
              type: (Array.isArray(cond2!.value) || isBlankOrNotBlank2) ? undefined : cond2!.matchMode,
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
          // @ts-expect-error TS2322
          result[key] = {
            filterType: Array.isArray(cond1!.value) ? 'set' : 'text',
            condition1: {
              type: Array.isArray(cond1!.value) ? undefined : cond1!.matchMode,
              filter: Array.isArray(cond1!.value) ? cond1!.value.map(({ code }) => code) : cond1!.value,
            },
          }
        }
      }
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

const filteredColumnDefs = computed(() => {
  return props.columnDefs.filter((col) => {
    const isNotHidden = !col.hide
    const isSelected = selectedColumnsIds.value.includes(col.field ?? '')
    return isNotHidden && isSelected
  })
})

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

//#region 📍------ SCROLL HEIGHT ------ 📍
const scrollHeight = ref('')

const computeScrollHeight = () => {
  const height = window.innerHeight
  const padding = height > 780 ? 370 : 275
  scrollHeight.value = `${height - padding}px`
}

onMounted(() => {
  computeScrollHeight()
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

  // Appliquer la pagination
  currentPage.value = dto.page ?? 1
  perPage.value = dto.perPage ?? 20

  // Notifier les changements et rafraîchir
  notifyFilterChanged()
  refreshTable()
}

useAmountLines()

defineExpose({
  refresh: refreshTable,
  clearAllFilters,
  removeFilter,
  updateDataTableState,
})
</script>

<template>
  <div class="h-full flex justify-between relative" :class="{ loading: isLoadingRows }">
    <DataTable
      v-model:filters="filters"
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
      @sort="onSortChanged"
      @row-click="onRowClick"
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
        :data-type="agGridFilterToDataTableDataType[col.filter]"
        :sortable="col.sortable === false ? undefined : true"
        :show-filter-match-modes="col.filter !== 'agSetColumnFilter'"
        :show-filter-menu="!col.suppressHeaderMenuButton"
        :title="col.headerName"
      >
        <template #body="{ data }">
          <template v-if="col.cellRenderer">
            <component :is="col.cellRenderer" :params="{ value: data[col.field!], ...col.cellRendererParams }" />
          </template>
          <template v-else-if="col.valueFormatter && typeof col.valueFormatter === 'function'">
            {{ col.valueFormatter({ value: data[col.field] }) }}
          </template>
          <template v-else>
            {{ data[col.field!] }}
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
          <div class="mb-4 mx-4">
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
    <div class="side-buttons">
      <div class="relative">
        <button type="button" @click.stop="displayColumns = !displayColumns">
          <div class="side-button-label">
            Colonnes
          </div>
        </button>
        <DataTableColumnList
          v-show="displayColumns"
          v-model="selectedColumnsIds"
          class="column-list p-2 -translate-x-8 -top-4 right-0 -left-60 absolute bg-white"
          :column-defs="columnDefs"
          @close="displayColumns = false"
        />
      </div>
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

.loading :deep(.p-datatable-tbody) {
  filter: blur(2px);
}

:root {
  --p-button-primary-background: #f90;
  --p-button-primary-border: #f90;
}

:deep(.p-paginator .fr-select-group) {
  max-width: 6rem;
}

:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
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
  --p-datatable-body-cell-padding: 0.5rem 0.75rem;
  vertical-align: middle;
  & p {
    margin-block: 0.25rem !important;
  }
}

:deep(.p-datatable-header-cell) {
  --p-datatable-header-cell-padding: 0.25rem 0.5rem;
}
:deep(.amount-line-highlighted) {
  background-color: var(--blue-ecume-975-75);
}
</style>
