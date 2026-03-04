<script lang="ts" setup>
import type { DataTableFilterMeta } from 'primevue/datatable'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import DatePicker from 'primevue/datepicker'
import { FilterMatchMode, FilterOperator } from '@primevue/core/api'
import type { HeaderDataTable } from '@/shared/types'
import { PAGINATION_PAGE_SIZE } from '@/config'
import { dealWithBlankAndNotBlank } from '../server-side/filters.utils'
import { serverFilterToDataTableDataType, SET_FILTER_TYPES } from '../server-side/utils/datatable.const'

export type RowDataType = {
  authorized: boolean
  cursor: string
}

const props = withDefaults(
  defineProps<{
    title?: string
    rowsData?: RowDataType[]
    actionTitle?: string
    headers?: HeaderDataTable[]
    paginationPageSize?: number
    withAction?: boolean
    rowSelection?: string
    floatingFilter?: boolean
    isHiddenSideBar?: boolean
    selectable?: boolean
    selectionMode?: 'single' | 'multiple'
    dataKey?: string
    context?: unknown
  }>(),
  {
    title: undefined,
    rowData: () => [],
    headers: () => [],
    paginationPageSize: PAGINATION_PAGE_SIZE,
    rowSelection: undefined,
    selectable: false,
    selectionMode: 'multiple',
    dataKey: undefined,
    context: undefined,
  },
)

const emit = defineEmits<{
  'rowClick': [data: unknown],
  'sortUpdated': [value: unknown]
  'selectionChange': [value: RowDataType[]]
}>()
interface PrimeVueColumnDef {
  headerName?: string
  field?: string
  width?: number
  cellRenderer?: Component | string | ((params: Record<string | symbol, unknown>) => string | undefined)
  hide?: boolean
  valueFormatter?: (params: { value: unknown }) => string
  filterParams?: {
    values?: string[]
    valueFormatter?: (params: { value: unknown }) => string
    cellRenderer?: Component // | string | ((params: Record<string | symbol, unknown>) => string | undefined)
    cellRendererParams?: Record<string, unknown>
  }
  filter?: string
  floatingFilter?: boolean
  filterable?: boolean
  sortable?: boolean
}

const columnDefs: ComputedRef<PrimeVueColumnDef[]> = computed(() => {
  if (!props.headers?.length) {
    return []
  }

  const filteredHeaders = props.headers
    .filter((header, idx) => (props.withAction && idx === 0) || header.type !== 'hidden')
    .map((header) => {
      const filter = {
        filter: header.filter,
      }
      const renderer = {
        cellRenderer:
          header.renderer ?? (header.parseFn ? (params: Record<string | symbol, unknown>) => header.parseFn?.(params.value) : undefined),
      }
      return {
        floatingFilter: props.floatingFilter,
        headerName: header.text || '',
        field: header.field,
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
      let matchMode = FilterMatchMode.CONTAINS
      if (col.filter === 'agMultiColumnFilter') {
        matchMode = FilterMatchMode.DATE_IS
      } else if (col.filter === 'agSetColumnFilter') {
        matchMode = FilterMatchMode.IN
      }
      return {
        ...acc,
        [col.field!]: {
          operator: FilterOperator.AND,
          constraints: [{
            value: null,
            matchMode,
            ...(col.filter === 'agSetColumnFilter' && col.filterParams?.values
              ? {
                  set: col.filterParams.values,
                }
              : {}),
          }],
        },
      }
    },
    {} as DataTableFilterMeta,
  ),
)

const processedRows = computed(() => {
  if (!props.rowsData) {
    return []
  }

  return props.rowsData.map((row) => {
    const newRow = { ...row } as Record<string, any>

    columnDefs.value.forEach((col) => {
      // Si la colonne est configurée comme une date
      if (col.filter === 'agMultiColumnFilter' && col.field) {
        const val = (row as Record<string, any>)[col.field]
        if (val && typeof val === 'string') {
          const dateObj = new Date(val)
          newRow[col.field] = Number.isNaN(dateObj.getTime()) ? val : dateObj
        }
      }
    })
    return newRow as RowDataType
  })
})

const selectedRows = ref<RowDataType[]>([])
const paginatorContainerRef = useTemplateRef('paginatorContainerRef')
const sort = ref<{ key: string; order: 'ASC' | 'DESC' | 'NONE' }[]>([])
const perPage = ref(props.paginationPageSize || PAGINATION_PAGE_SIZE)
const scrollHeight = computed(() => {
  return `calc(100% - ${paginatorContainerRef.value?.parentElement?.offsetHeight || 4}px)`
})
function shouldShowFilterControls (col: PrimeVueColumnDef): boolean {
  if (typeof col.filter === 'string') {
    return !SET_FILTER_TYPES.includes(col.filter as any)
  }
  return true
}

const rowClick = (event: { data: Record<string, string | number> }) => {
  emit('rowClick', toRaw(event.data))
}

const getPaginationPages = (pagesNb: number) => Array.from(Array(pagesNb))
  .map((_, i) => ({ title: (i + 1).toString(), href: `#${i + 1}`, label: (i + 1).toString() }))

watch(selectedRows, (newValue) => {
  emit('selectionChange', toRaw(newValue))
})
</script>

<template>
  <DataTable
    v-model:selection="selectedRows"
    v-model:filters="filters"
    :selection-mode="selectable ? selectionMode : undefined"
    :data-key="dataKey"
    class="m-w-full h-full"
    :value="processedRows"
    striped-rows
    paginator
    :rows="perPage"
    :rows-per-page-options="[20, 50, 100]"
    scrollable
    :first="0"
    removable-sort
    :scroll-height="scrollHeight"
    row-hover
    filter-display="menu"
    :sort-field="sort[0]?.key"
    :sort-order="sort[0]?.order === 'ASC' ? 1 : (sort[0]?.order === 'DESC' ? -1 : 0)"
    :row-style="(data) => {
      return {
        cursor: data.cursor || 'auto',
      }
    }"
    @row-click="rowClick($event)"
  >
    <template v-if="title" #header>
      <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
        <span class="text-2xl font-bold">{{ title }}</span>
      </div>
    </template>
    <Column
      v-if="selectable"
      selection-mode="multiple"
      header-style="width: 3rem"
    />
    <Column
      v-for="col of columnDefs"
      :key="col.field"
      :field="col.field"
      :header="col.headerName"
      :filter-field="col.field"
      :data-type="col.filter ? serverFilterToDataTableDataType[col.filter] : undefined"
      :sortable="col.sortable !== false"
      :show-add-button="shouldShowFilterControls(col)"
      :show-filter-match-modes="shouldShowFilterControls(col)"
      :show-filter-menu="col.filterable !== false"
      :title="col.headerName"
    >
      <template #body="{ data }">
        <template v-if="col.cellRenderer">
          <component
            :is="col.cellRenderer"
            :params="{
              value: data[col.field!],
              data,
              context,
            }"
          />
        </template>
        <template v-else-if="col.valueFormatter && typeof col.valueFormatter === 'function' && col.field">
          {{ col.valueFormatter({ value: data[col.field] } as any) }}
        </template>
        <template v-else>
          {{ data[col.field!] }}
        </template>
      </template>
      <template #filter="{ filterModel, filterCallback }">
        <template v-if="col.filter === 'agSetColumnFilter'">
          <!-- TODO: A refaire pour qu'il soit plus générique -->
          <PrimeSetFilter
            :model-value="{
              filterType: 'set',
              includeEmpty: false,
              filter: filterModel.value || col.filterParams?.values,
            }"
            :params="{
              values: col.filterParams?.values,
              valueFormatter: col.filterParams?.valueFormatter,
              cellRenderer: col.filterParams?.cellRenderer,
              cellRendererParams: col.filterParams?.cellRendererParams,
            }"
            :filter-callback="filterCallback"
            @update:model-value="($event) => {
              console.log({ setFilterValue: $event, filterModel: filterModel.value })
              filterModel.value = $event.filter
              filterCallback()
            }"
          />
        </template>
        <template v-else-if="col.filter === 'agMultiColumnFilter'">
          <DatePicker
            v-model="filterModel.value"
            date-format="dd/mm/yy"
            placeholder="jj/mm/aaaa"
            @date-select="filterCallback()"
            @clear="filterCallback()"
          />
        </template>
        <template v-else-if="col.filter === 'agDateColumnFilter'">
          <DatePicker
            v-model="filterModel.value"
            date-format="dd/mm/yy"
            placeholder="jj/mm/aaaa"
            @date-select="filterCallback()"
            @clear="filterCallback()"
          />
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
    <template #empty>
      <div class="flex justify-center items-center py-8 text-gray-500">
        Aucune donnée disponible.
      </div>
    </template>
    <template
      #paginatorcontainer="{ first, last, page, pageCount, changePageCallback, totalRecords }"
    >
      <div
        v-if="pageCount && pageCount > 1"
        ref="paginatorContainerRef"
        class="flex justify-end items-center"
      >
        <DsfrSelect
          v-model.number="perPage"
          title="Résultats par page"
          aria-label="Résultats par page"
          :options="[10, 20, 50, 100]"
          default-unselected-text="Résultats par page"
        />
        <div class="mx-4 mb-4">
          <template v-if="(pageCount ?? 0) > 0">
            {{ first }} à {{ last }} de {{ totalRecords }}
          </template>
          <template v-else>
            Aucun résultat
          </template>
        </div>
        <DsfrPagination
          :current-page="page"
          :pages="getPaginationPages(pageCount ?? 0)"
          @update:current-page="changePageCallback($event)"
        />
      </div>
    </template>
  </DataTable>
</template>
