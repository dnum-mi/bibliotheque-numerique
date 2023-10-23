<script lang="ts" setup generic="T extends DynamicKeys">
import { AgGridVue } from 'ag-grid-vue3'
import {
  ColumnApi,
  GridApi,
} from 'ag-grid-community'
import type {
  GridReadyEvent,
  IServerSideGetRowsParams,
  SelectionChangedEvent,
} from 'ag-grid-community'
import type { GridOptions, SetFilterModel } from 'ag-grid-enterprise'
import { gridOptionFactory } from '@/components/ag-grid/server-side/grid-option-factory'
import { ref } from 'vue'
import type { DynamicKeys, PaginationDto } from '@biblio-num/shared'
import {
  fromAggToBackendFilter,
  fromAggToBackendSort,
} from '@/components/ag-grid/server-side/pagination.utils'
import type { BNColDef } from '@/components/ag-grid/server-side/bn-col-def.interface'
import type { FilterModel } from '@/components/ag-grid/server-side/filter-model.interface'

const pageSize = 20

const props = withDefaults(
  defineProps<{
    paginationDto?: PaginationDto<T>;
    columnDefs: BNColDef[];
    apiCall:(params: PaginationDto<T>) => Promise<{ total: number; data: T[] }>;
    onSelectionChanged: ($event: SelectionChangedEvent) => void;
    loading?: boolean;
    preCondition?: boolean;
    specificGridOption?: Partial<GridOptions>;
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
  },
)

const emit = defineEmits<{
  'gridReady': [p: GridReadyEvent],
  'update:paginationDto': [p: PaginationDto<T>],
}>()

const gridApi = ref<GridApi | undefined>()
const columnApi = ref<ColumnApi | undefined>()

const refresh = () => {
  if (gridApi.value) {
    gridApi.value.refreshServerSide({ purge: true })
  }
}

const hasfilterEnumUnselectedAll = (filterModel: Record<string, FilterModel>) => {
  const enumIds: (string| undefined)[] = props.columnDefs.filter(colDef =>
    colDef.fieldType === 'enum',
  ).map(colDef => colDef.field)

  if (!enumIds) {
    return false
  }
  for (const emunId of enumIds) {
    const filter = Object.entries(filterModel)
      .find(([key, value]) => key === emunId &&
                              value.filterType === 'set' &&
                              !(value as SetFilterModel).values.length)
    if (filter) return true
  }
  return false
}

// function called by aggrid in SSR mode to fetch its data
const getRows = async (params: IServerSideGetRowsParams) => {
  try {
    const hasFilterEnumEmpty = hasfilterEnumUnselectedAll(params.request.filterModel)
    if (hasFilterEnumEmpty) {
      params.success({ rowData: [], rowCount: 0 })
      return
    }

    if (props.loading) return undefined
    if (props.preCondition) {
      const dto: PaginationDto<T> = {
        sorts: fromAggToBackendSort(params.request.sortModel),
        filters: fromAggToBackendFilter<T>(params.request.filterModel),
        columns: params.columnApi
          .getColumnState()
          .filter((state) => !state.hide)
          .map((state) => state.colId),
        perPage: pageSize,
        page: (params.request.startRow || 0) / pageSize + 1,
      }
      emit('update:paginationDto', dto)
      const response = await props.apiCall(dto)

      params.success({ rowData: response.data, rowCount: response.total })
    } else {
      params.fail()
    }
  } catch (error) {
    params.fail()
    console.error(error)
    throw error
  }
}
const gridOptions = {
  ...gridOptionFactory(getRows, pageSize),
  ...props.specificGridOption,
}

const onGridReady = (event: GridReadyEvent) => {
  gridApi.value = event.api
  columnApi.value = event.columnApi
  emit('gridReady', event)
}

defineExpose({
  refresh,
})
</script>

<template>
  <ag-grid-vue
    class="ag-theme-material"
    :column-defs="columnDefs"
    :grid-options="gridOptions"
    :row-style="{ cursor: 'pointer' }"
    @grid-ready="onGridReady($event)"
    @column-visible="refresh()"
    @selection-changed="onSelectionChanged($event)"
  />
</template>

<style scoped></style>
