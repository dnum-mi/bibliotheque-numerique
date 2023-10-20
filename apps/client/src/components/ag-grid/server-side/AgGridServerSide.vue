<script lang="ts" setup generic="T extends DynamicKeys">
import { AgGridVue } from 'ag-grid-vue3'
import {
  ColumnApi,
  GridApi,
  type ColDef,
  type GridReadyEvent,
  type IServerSideGetRowsParams,
  type SelectionChangedEvent,
} from 'ag-grid-community'
import type { GridOptions } from 'ag-grid-enterprise'
import { gridOptionFactory } from '@/components/ag-grid/server-side/grid-option-factory'
import { ref } from 'vue'
import type { DynamicKeys, PaginationDto } from '@biblio-num/shared'
import { fromAggToBackendFilter, fromAggToBackendSort } from '@/components/ag-grid/server-side/pagination.utils'

const pageSize = 20

const props = withDefaults(
  defineProps<{
    paginationDto?: PaginationDto<T>;
    columnDefs: ColDef[];
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

const gridApi = ref<GridApi>()
const columnApi = ref<ColumnApi>()

const refresh = () => {
  if (gridApi.value) {
    gridApi.value.refreshServerSide({ purge: true })
  }
}

// function called by aggrid in SSR mode to fetch its data
const getRows = async (params: IServerSideGetRowsParams) => {
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
