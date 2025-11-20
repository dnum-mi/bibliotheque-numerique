<script lang="ts" setup generic="T extends DynamicKeys">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import type { FilterChangedEvent, GridApi, GridReadyEvent, IServerSideGetRowsParams, SelectionChangedEvent } from 'ag-grid-community'
import type { ColumnMovedEvent, GridOptions, SetFilterModel } from 'ag-grid-enterprise'

import type { DynamicKeys, IPagination } from '@biblio-num/shared'
import type { ApiCall } from './pagination.utils'

import { gridOptionFactory } from '@/components/ag-grid/server-side/grid-option-factory'
import { fromAggToBackendFilter, fromAggToBackendSort, backendFilterToAggFilter } from '@/components/ag-grid/server-side/pagination.utils'
import type { BNColDef } from '@/components/ag-grid/server-side/bn-col-def.interface'
import type { FilterModel } from '@/components/ag-grid/server-side/filter-model.interface'
import type { AgGridFilterModel, DisplayActiveFilter } from '../active-filters/activeFilters.type'
import { useEventListener } from '@vueuse/core'
import { DsfrCheckbox } from '@gouvminint/vue-dsfr'

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

//#region 📍------ EVENTS ------ 📍

const emit = defineEmits<{
  gridReady: [p: GridReadyEvent]
  'update:paginationDto': [p: IPagination<T>]
  filtersUpdated: [filters: DisplayActiveFilter[]]
}>()

//#endregion

//#region 📍------ ON CLICK ------ 📍
const filterAreOpened = ref<boolean>(false)

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    filterAreOpened.value = false
  }
}

useEventListener('keydown', onKeyDown)

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

//#endregion

//#region 📍------ LOCAL STORAGE ------ 📍
const saveToLocalStorage = (dto: IPagination<T>) => {
  if (!props.localStorageKey) {
    return
  }
  try {
    const data = JSON.stringify(dto)
    //    localStorage.setItem(props.localStorageKey, data)
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

//#region 📍------ DATA ------ 📍
const rowData = ref()
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

const selectedColumnsIds = ref(props.columnDefs.map((col) => col.field ?? ''))

const getRows = async (params: { fail: () => void; request: GridRequest }) => {
  console.log('Loading rows...')
  // if (props.loading) {
  //   return
  // }

  console.log('DataTable selectedColumnsIds:', selectedColumnsIds.value)

  const dto: IPagination<T> = {
    sorts: fromAggToBackendSort(params.request.sortModel, selectedColumnsIds.value),
    filters: fromAggToBackendFilter<T>(params.request.filterModel, selectedColumnsIds.value),
    columns: selectedColumnsIds.value,
    perPage: pageSize,
    page: (params.request.startRow || 0) / pageSize + 1,
  }
  emit('update:paginationDto', dto)
  saveToLocalStorage(dto)

  try {
    const response = await props.apiCall(dto)
    // params.success({ rowData: response.data, rowCount: response.total })
    rowData.value = response.data
    console.log({ rowData: response.data })
  } catch {
    console.log({ rowData: 'fail' })
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

const filteredColumnDefs = computed(() => {
  return props.columnDefs.filter((col) => {
    const isVisible = !col.hide
    const isSelected = selectedColumnsIds.value.includes(col.field ?? '')
    return isVisible && isSelected
  })
})

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
//#endregion

onMounted(() => {
  getRows({
    fail () {
      console.warn('Failed to load rows')
    },
    request: {
      endRow: pageSize,
      startRow: 0,
      filterModel: {},
      sortModel: [],
    },
  })
})

defineExpose({
  refresh,
  clearAllFilters,
  removeFilter,
})

const displayColumns = ref(false)
</script>

<template>
  <div class="h-full flex justify-between">
    <DataTable
      :value="rowData"
    >
      <Column
        v-for="col of filteredColumnDefs"
        :key="col.field"
        :field="col.field"
        :header="col.headerName"
      />
    </DataTable>
    <div class="side-buttons">
      <div class="relative">
        <button type="button" @click="displayColumns = !displayColumns">
          <div class="side-button-label">
            Colonnes
          </div>
        </button>
        <div
          v-if="displayColumns"
          class="p-2 -translate-x-8 top-0 right-0 -left-50 absolute bg-white"
        >
          Liste des colonnes

          <ul>
            <li v-for="col of columnDefs" :key="col.field" class="flex justify-start">
              <DsfrCheckbox
                v-model="selectedColumnsIds"
                legend="Liste des colonnes à afficher"
                name="column"
                :value="col.field"
                :label="col.headerName"
              />
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.side-button-label {
  writing-mode: vertical-lr;
}
</style>
