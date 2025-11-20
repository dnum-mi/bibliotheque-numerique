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
      perPage: 20,
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

const displayColumns = ref(false)
const perPage = ref(20)
const isLoadingRows = ref(false)

//#region 📍------ ON CLICK ------ 📍
const filterAreOpened = ref<boolean>(false)

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    filterAreOpened.value = false
  }
}

useEventListener('keydown', onKeyDown)

//#endregion

//#region 📍------ LOCAL STORAGE ------ 📍
const saveToLocalStorage = (dto: IPagination<T>) => {
  if (!props.localStorageKey) {
    return
  }
  try {
    const data = JSON.stringify(dto)
    localStorage.setItem(`${props.localStorageKey}-pv`, data)
  } catch (e) {
    console.warn('Erreur de sauvegarde dans localStorage', e)
  }
}
//#endregion

//#region 📍------ DATA ------ 📍
const currentPage = ref(1)
const rowData = ref()

const selectedColumnsIds = ref(props.columnDefs.map((col) => col.field ?? ''))

const totalRecords = ref(0)

const sort = ref<{ key: string; order: 'ASC' | 'DESC' }[]>([])
const filters = ref<DataTableFilterMeta>(props.columnDefs
  .reduce(
    (acc, col) => ({
      ...acc,
      [col.field!]: {
        operator: FilterOperator.AND,
        constraints: [{
          value: null,
          matchMode: col.filter === 'agSetColumnFilter' ? FilterMatchMode.IN : FilterMatchMode.STARTS_WITH,
          ...(col.filter === 'agSetColumnFilter'
            ? {
                set: col.filterParams.values.map(
                  (value: string) => !col.filterParams.valueFormatter ? value : { name: col.filterParams.valueFormatter({ value }), code: value },
                ),
              }
            : {}),

        }],
      },
    }),
    {} as DataTableFilterMeta,
  ),
)

const filtersToSend = computed<Record<keyof typeof props.columnDefs, IFilter>>(() => {
  console.log('filters.value', filters.value)
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
    filters: Object.keys(filtersToSend.value).length > 0 ? filtersToSend.value as Record<keyof T, IFilter> : null,
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
    // const isVisible = !col.hide
    const isSelected = selectedColumnsIds.value.includes(col.field ?? '')
    return isSelected
  })
})

watch(filtersToSend, () => {
  getRows(1)
})

function onSortChanged (sortEvent: DataTableSortEvent) {
  const { sortField, sortOrder } = sortEvent
  const isSorted = sortField !== null && sortOrder !== null
  sort.value = isSorted ? [{ key: sortField as string, order: sortOrder === 1 ? 'ASC' : 'DESC' }] : []
  getRows(1)
}
//#endregion

watch(perPage, () => getRows(1))

onMounted(() => {
  getRows(1)
})

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

function dealWithBlankAndNotBlank (filterModel: { matchMode: unknown, value: unknown }) {
  if (filterModel.matchMode === 'blank' || filterModel.matchMode === 'notBlank') {
    filterModel.value = filterModel.matchMode
  }
}
</script>

<template>
  <div class="h-full flex justify-between relative" :class="{ loading: isLoadingRows }">
    <DataTable
      v-model:filters="filters"
      :style="{ width: 'calc(100vw - 38px)' }"
      :value="rowData"
      striped-rows
      paginator
      lazy
      :rows="perPage"
      :rows-per-page-options="[20, 50, 100]"
      scrollable
      :first="0"
      removable-sort
      :scroll-height="scrollHeight"
      filter-display="menu"
      @sort="onSortChanged"
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
        sortable
        :show-filter-match-modes="col.filter !== 'agSetColumnFilter'"
      >
        <template #body="{ data }">
          <template v-if="col.cellRenderer">
            <component :is="col.cellRenderer" :params="{ value: data[col.field!] }" />
          </template>
          <template v-else>
            {{ data[col.field!] }}
          </template>
        </template>
        <template #filter="{ filterModel, filterCallback }">
          <template v-if="(filterModel as unknown as { set: {name: string, code: string}[] }).set">
            <MultiSelect
              v-model="filterModel.value"
              :options="(filterModel as unknown as { set: {name: string, code: string}[] }).set"
              option-label="name" placeholder="Any"
              @change="filterCallback()"
            >
              <template #option="slotProps">
                <component :is="col.cellRenderer" :params="{ value: slotProps.option.name }" />
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
        <button type="button" @click="displayColumns = !displayColumns">
          <div class="side-button-label">
            Colonnes
          </div>
        </button>
        <DataTableColumnList
          v-if="displayColumns"
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
</style>
