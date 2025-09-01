<script lang="ts" setup generic="T extends DynamicKeys">
import { AgGridVue } from 'ag-grid-vue3'
import type { FilterChangedEvent, GridApi, GridReadyEvent, IServerSideGetRowsParams, SelectionChangedEvent } from 'ag-grid-community'
import type { ColumnMovedEvent, GridOptions, SetFilterModel } from 'ag-grid-enterprise'

import type { DynamicKeys, IPagination } from '@biblio-num/shared'
import type { ApiCall } from './pagination.utils'

import { gridOptionFactory } from '@/components/ag-grid/server-side/grid-option-factory'
import { fromAggToBackendFilter, fromAggToBackendSort, backendFilterToAggFilter } from '@/components/ag-grid/server-side/pagination.utils'
import type { BNColDef } from '@/components/ag-grid/server-side/bn-col-def.interface'
import type { FilterModel } from '@/components/ag-grid/server-side/filter-model.interface'
import type { AgGridFilterModel, DisplayActiveFilter } from '../active-filters/activeFilters.type'

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
  }>(),
  {
    paginationDto: () => ({
      page: 1,
      perPage: pageSize,
      sorts: [],
      filters: null,
      columns: [],
    }),
    specificGridOption: () => ({}),
    localStorageKey: undefined,
  },
)

//#endregion

const emit = defineEmits<{
  gridReady: [p: GridReadyEvent]
  'update:paginationDto': [p: IPagination<T>]
  filtersUpdated: [filters: DisplayActiveFilter[]]
}>()

//#region 📍------ ON CLICK ------ 📍
const filterAreOpened = ref<boolean>(false)

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    filterAreOpened.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeyDown)
})

const onClick = (event: SelectionChangedEvent) => {
  // do not load the line if the user click outside filter to close the filter
  if (!filterAreOpened.value) {
    props.onSelectionChanged(event)
  } else {
    // next time we click we want to load the line
    filterAreOpened.value = false
  }
}

const pageSize = 20

const gridApi = ref<GridApi | undefined>()

const refresh = () => {
  if (gridApi.value) {
    setTimeout(() => gridApi.value?.refreshServerSide({ purge: true }))
  }
}

//#region 📍------ LOCAL STORAGE ------ 📍
const saveToLocalStorage = (dto: IPagination<T>) => {
  if (!props.localStorageKey) {
    return
  }
  try {
    const data = JSON.stringify(dto)
    localStorage.setItem(props.localStorageKey, data)
  } catch (e) {
    console.warn('Erreur de sauvegarde dans localStorage', e)
  }
}

const restoreFromLocalStorage = () => {
  if (!props.localStorageKey || !gridApi.value) {
    return
  }
  try {
    const saved = localStorage.getItem(props.localStorageKey)
    if (!saved) {
      return
    }
    const dto: IPagination<T> = JSON.parse(saved)

    gridApi.value.setFilterModel(backendFilterToAggFilter(dto.filters || {}))

    const stateHash = Object.fromEntries(gridApi.value.getColumnState().map((c) => [c.colId, c]))
    const sortHash = Object.fromEntries(dto.sorts.map((s) => [s.key, s]))

    gridApi.value.applyColumnState({
      state: dto.columns.map((c) => {
        const result = {
          ...stateHash[c],
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

    emit('update:paginationDto', dto)
  } catch (e) {
    console.warn('Erreur de restauration depuis localStorage', e)
  }
}
//#endregion

const hasfilterEnumUnselectedAll = (filterModel: Record<string, FilterModel>) => {
  const enumIds: (string | undefined)[] = props.columnDefs.filter((colDef) => colDef.fieldType === 'enum').map((colDef) => colDef.field)

  if (!enumIds) {
    return false
  }

  for (const emunId of enumIds) {
    const filter = Object.entries(filterModel).find(
      ([key, value]) => key === emunId && value.filterType === 'set' && !(value as SetFilterModel).values.length,
    )
    if (filter) {
      return true
    }
  }

  return false
}

const getRows = async (params: IServerSideGetRowsParams) => {
  const hasFilterEnumEmpty = hasfilterEnumUnselectedAll(params.request.filterModel)
  if (hasFilterEnumEmpty) {
    params.success({ rowData: [], rowCount: 0 })
    return
  }
  if (props.loading) {
    return
  }

  const selectedColumnsIds = params.api.getAllDisplayedColumns().map((col) => col.getColId())

  if (props.preCondition) {
    const dto: IPagination<T> = {
      sorts: fromAggToBackendSort(params.request.sortModel, selectedColumnsIds),
      filters: fromAggToBackendFilter<T>(params.request.filterModel, selectedColumnsIds),
      columns: params.api
        .getColumnState()
        .filter((state) => !state.hide)
        .map((state) => state.colId),
      perPage: pageSize,
      page: (params.request.startRow || 0) / pageSize + 1,
    }
    emit('update:paginationDto', dto)
    saveToLocalStorage(dto)

    try {
      const response = await props.apiCall(dto)
      params.success({ rowData: response.data, rowCount: response.total })
    } catch {
      params.fail()
    }
  } else {
    params.fail()
  }
}

const gridOptions = {
  ...gridOptionFactory(getRows, pageSize),
  ...props.specificGridOption,
}

const notifyFilterChanged = () => {
  if (gridApi.value) {
    const filterModel = gridApi.value.getFilterModel() as AgGridFilterModel
    const filters: DisplayActiveFilter[] = []
    for (const colId in filterModel) {
      if (Object.prototype.hasOwnProperty.call(filterModel, colId)) {
        filters.push({ colId, ...filterModel[colId] })
      }
    }
    emit('filtersUpdated', filters)
  }
}

const onFilterChanged = (_event: FilterChangedEvent) => {
  notifyFilterChanged()
}

const clearAllFilters = () => {
  if (gridApi.value) {
    gridApi.value.setFilterModel(null)
  }
}

const removeFilter = async (colId: string) => {
  if (gridApi.value) {
    const filterInstance = await gridApi.value.getColumnFilterInstance(colId)
    if (filterInstance) {
      filterInstance.setModel(null)
      gridApi.value.onFilterChanged()
    }
  }
}

const onGridReady = (event: GridReadyEvent) => {
  gridApi.value = event.api
  emit('gridReady', event)
  restoreFromLocalStorage()
  notifyFilterChanged()
}

const onColumnMoved = (event: ColumnMovedEvent) => {
  if (event.finished) {
    refresh()
  }
}

onMounted(() => {
  const label = document.getElementById('ag-12008-label')
  if (label) {
    label.textContent = 'Nombre d’éléments par page'
  }
})

defineExpose({
  refresh,
  clearAllFilters,
  removeFilter,
})
</script>

<template>
  <div class="h-full flex flex-col">
    <AgGridVue
      class="ag-theme-material m-w-full h-full"
      :column-defs="columnDefs"
      :grid-options="gridOptions"
      :row-style="{ cursor: 'pointer' }"
      @grid-ready="onGridReady($event)"
      @column-moved="onColumnMoved($event)"
      @column-visible="refresh()"
      @selection-changed="onClick($event)"
      @filter-opened="filterAreOpened = true"
      @filter-changed="onFilterChanged"
    />
  </div>
</template>
