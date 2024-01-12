import type {
  DateFilterConditionDto,
  EnumFilterConditionDto,
  FilterDto,
  NumberFilterConditionDto,
  SortDto,
  TextFilterConditionDto,
} from '@biblio-num/shared'
import {
  type DateFilterModel,
  type IMultiFilterModel,
  type NumberFilterModel,
  type SetFilterModel,
  type SortModelItem,
  type TextFilterModel,
} from 'ag-grid-community'
import type { AgGridCommon } from 'ag-grid-community/dist/lib/interfaces/iCommon'

type FilterModel = Parameters<AgGridCommon<unknown, unknown>['api']['setFilterModel']>[0]

const _fromAggDateFilterToBackendFilter = (filter: DateFilterModel): FilterDto => ({
  filterType: filter.filterType as string,
  condition1: {
    filter: filter.dateFrom,
    filterTo: filter.dateTo,
    type: filter.type,
  } as DateFilterConditionDto,
})

const _fromAggSetFilterToBackendFilter = (filter: SetFilterModel): FilterDto => ({
  filterType: filter.filterType as string,
  condition1: {
    filter: filter.values,
  } as EnumFilterConditionDto,
})

const _fromAggNumberFilterToBackendFilter = (filter: NumberFilterModel): FilterDto => ({
  filterType: filter.filterType as string,
  condition1: {
    filter: filter.filter,
    type: filter.type,
  } as NumberFilterConditionDto,
})

const _fromAggStringFilterToBackendFilter = (filter: TextFilterModel): FilterDto => ({
  filterType: filter.filterType as string,
  condition1: {
    filter: filter.filter,
    type: filter.type,
  } as TextFilterConditionDto,
})

// multi filter now is only used for date
const _fromAggMultiFilterToBackendFilter = (filter: IMultiFilterModel): FilterDto => {
  const sinceValue = filter.filterModels?.[1]?.value
  if (sinceValue) {
    return {
      filterType: 'date',
      condition1: {
        sinceWhen: sinceValue,
        type: 'since',
      } as DateFilterConditionDto,
    }
  } else {
    return _fromAggDateFilterToBackendFilter(filter.filterModels?.[0] as DateFilterModel)
  }
}

export const fromAggToBackendFilter = <T>(filterModel: Record<string, FilterModel>): Record<keyof T, FilterDto> | null => {
  const entries = Object.entries(filterModel)
  if (entries.length) {
    const filters: Record<string, FilterDto> = {}
    entries.forEach(([key, value]) => {
      switch (true) {
        case ('condition1' in value): // there is two conditions
          delete value.conditions
          filters[key] = value as FilterDto
          break
        case value.filterType === 'date': {
          filters[key] = _fromAggDateFilterToBackendFilter(value as DateFilterModel)
          break
        }
        case value.filterType === 'set': {
          filters[key] = _fromAggSetFilterToBackendFilter(value as SetFilterModel)
          break
        }
        case value.filterType === 'number': {
          filters[key] = _fromAggNumberFilterToBackendFilter(value as NumberFilterModel)
          break
        }
        // multi for now is only used for date
        case value.filterType === 'multi': {
          filters[key] = _fromAggMultiFilterToBackendFilter(value as IMultiFilterModel)
          break
        }
        case value.filterType === 'text':
        default: {
          filters[key] = _fromAggStringFilterToBackendFilter(value as TextFilterModel)
          break
        }
      }
    })
    return filters as Record<keyof T, FilterDto>
  } else {
    return null
  }
}

export const fromAggToBackendSort = (sortModel: SortModelItem[]): SortDto[] => {
  return sortModel.map((sort) => ({
    key: sort.colId,
    order: sort.sort === 'asc' ? 'ASC' : 'DESC',
  }))
}

export const backendFilterToAggFilter = (filters: Record<string, FilterDto>): FilterModel => {
  const entries = Object.entries(filters)
  if (entries.length) {
    const aggFilters: FilterModel = {}
    entries.forEach(([key, value]) => {
      if (value.condition2) {
        aggFilters[key] = filters[key]
      } if (value.filterType === 'date' && value.condition1?.type === 'since') {
        aggFilters[key] = {
          filterType: 'multi',
          filterModels: [
            null,
            {
              value: (value.condition1 as DateFilterConditionDto).sinceWhen,
            },
          ],
        }
      } else {
        aggFilters[key] = {
          filterType: value.filterType,
          filter: value.condition1.filter,
          type: value.condition1.type,
        }
      }
    })
    return aggFilters
  } else {
    return {}
  }
}
