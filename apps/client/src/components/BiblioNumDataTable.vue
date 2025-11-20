<script lang="ts" setup>
import type { RowStyle } from 'ag-grid-enterprise'

import { PAGINATION_PAGE_SIZE } from '@/config'
import DataTable, { type DataTableFilterMeta } from 'primevue/datatable';
import Column from 'primevue/column';
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import { useRouter } from 'vue-router'
import type { HeaderDataTable } from '@/shared/types';

const props = withDefaults(
  defineProps<{
    title?: string
    rowData?: Record<string, string | number>[]
    actionTitle: string
    headers?: HeaderDataTable[]
    pagination?: boolean
    paginationPageSize?: number
    withAction?: boolean
    rowSelection?: string
    floatingFilter?: boolean
    isHiddenSideBar?: boolean
    rowStyle?: RowStyle
  }>(),
  {
    title: undefined,
    rowData: () => [],
    headers: () => [],
    paginationPageSize: PAGINATION_PAGE_SIZE,
    rowSelection: undefined,
    rowStyle: () => ({}),
  },
)

const emit = defineEmits(['getElt', 'selectionChanged', 'filtersUpdated', 'sortUpdated'])

interface PrimeVueColumnDef {
  headerName?: string
  field?: string
  width?: number
  cellRenderer?: Component | string | ((params: Record<string | symbol, unknown>) => string | undefined)
  hide?: boolean
  valueFormatter?: (params: { value: unknown }) => string
  filterParams?: { values?: string[]; valueFormatter?: (params: { value: unknown }) => string }
  filter?: string
  floatingFilter?: boolean
  filterable?: boolean
  sortable?: boolean
}

const columnDefs: ComputedRef<PrimeVueColumnDef[]> = computed(() => {
  if (!props.headers.length) {
    return []
  }
  const headers: HeaderDataTable[] = [...props.headers]

  const filteredHeaders = headers
    .filter((header, idx) => (props.withAction && idx === 0) || header.type !== 'hidden')
    .map((header) => {
      const filter = {}
      const renderer = {
        cellRenderer:
          header.renderer ?? (header.parseFn ? (params: Record<string | symbol, unknown>) => header.parseFn?.(params.value) : undefined),
      }
      return {
        floatingFilter: props.floatingFilter,
        headerName: header.text || '',
        field: header.value,
        width: header.width || undefined,
        ...renderer,
        ...filter,
        hide: header.hide,
        valueFormatter: header?.valueFormatter as PrimeVueColumnDef['valueFormatter'],
        filterParams: header?.filterParams as PrimeVueColumnDef['filterParams'],
        filterable: header.filterable !== false, // Par défaut, les colonnes sont filtrables
        sortable: header.sortable !== false, // Par défaut, les colonnes sont triables
      }
    })
    return filteredHeaders
})

const filters = ref<DataTableFilterMeta>(columnDefs.value
  .filter(col => col.filterable !== false) // Ne créer des filtres que pour les colonnes filtrables
  .reduce(
    (acc, col) => {

      return {
      ...acc,
      [col.field!]: {
        operator: FilterOperator.AND,
        constraints: [{
          value: null,
          matchMode: col.filter === 'agSetColumnFilter' ? FilterMatchMode.IN : FilterMatchMode.STARTS_WITH,
          ...(col.filter === 'agSetColumnFilter' && col.filterParams?.values
            ? {
                set: col.filterParams.values.map(
                  (value: string) => !col.filterParams?.valueFormatter ? value : { name: col.filterParams.valueFormatter({ value }), code: value },
                ),
              }
            : {}),

        }],
      },
    }},
    {} as DataTableFilterMeta,
  ),
)
const sort = ref<{ key: string; order: 'ASC' | 'DESC' | 'NONE' }[]>([])
const perPage = computed(() => props.paginationPageSize || PAGINATION_PAGE_SIZE)
const scrollHeight = computed(() => (props.pagination ? 'calc(100vh - 300px)' : 'calc(100vh - 200px)'))
const selectedColumnsIds = ref(columnDefs.value.map((col) => col.field ?? ''))

function onSortChanged(event: { sortField: string; sortOrder: number }) {
  sort.value = []
  if (event.sortField && event.sortOrder) {
    sort.value.push({ key: event.sortField, order: event.sortOrder === 1 ? 'ASC' : 'DESC' })
  }
  emit('sortUpdated', sort.value)
}
const debug = ref('false')

const router = useRouter()
const rowClick = (event: { data: Record<string, string | number> }) => {
  router.push({ name: 'DemarcheDossiers', params: { demarcheId: event.data.id } })
}
</script>

<template>
  <h4 v-if="title">
    {{ title }}
  </h4>
  <DataTable
    v-model:filters="filters"
    :style="{ width: 'calc(100vw - 38px)' }"
    :value="rowData"
    striped-rows
    paginator
    :rows="perPage"
    :rows-per-page-options="[20, 50, 100]"
    scrollable
    :first="0"
    removable-sort
    :scroll-height="scrollHeight"
    row-hover
    @row-click="rowClick($event)"
    filter-display="menu"
    :sort-field="sort[0]?.key"
    :sort-order="sort[0]?.order === 'ASC' ? 1 : (sort[0]?.order === 'DESC' ? -1 : 0)"
  >
    <Column
      v-for="col of columnDefs"
      :key="col.field"
      :field="col.field"
      :header="col.headerName"
      :sortable="col.sortable !== false"
      :show-filter-match-modes="col.filter !== 'agSetColumnFilter'"
      :show-filter-menu="col.filterable !== false"
    >
      <template #body="{ data }">
        <template v-if="col.cellRenderer">
          <component :is="col.cellRenderer" :params="{ value: data[col.field!] }" />
        </template>
        <template v-else>
          {{ data[col.field!] }}
        </template>
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
:deep(.p-datatable-tbody > tr) {
  cursor: pointer;
}

:deep(.p-datatable-tbody) {
  --p-datatable-row-hover-background: var(--blue-france-925-125);
}
</style>
