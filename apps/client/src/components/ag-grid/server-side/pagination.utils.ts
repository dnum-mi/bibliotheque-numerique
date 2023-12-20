import type {
  DateFilterConditionDto,
  EnumFilterConditionDto,
  FilterDto,
  NumberFilterConditionDto,
  SortDto,
  TextFilterConditionDto,
} from '@biblio-num/shared'
import type {
  DateFilterModel,
  NumberFilterModel,
  SetFilterModel,
  SortModelItem,
  TextFilterModel,
} from 'ag-grid-community'
import type { AgGridCommon } from 'ag-grid-community/dist/lib/interfaces/iCommon'

export const fromAggToBackendSort = (sortModel: SortModelItem[]): SortDto[] => {
  return sortModel.map((sort) => ({
    key: sort.colId,
    order: sort.sort === 'asc' ? 'ASC' : 'DESC',
  }))
}

type FilterModel = Parameters<AgGridCommon<unknown, unknown>['api']['setFilterModel']>[0]
export const fromAggToBackendFilter = <T>(filterModel: Record<string, FilterModel>): Record<keyof T, FilterDto> | null => {
  const entries = Object.entries(filterModel)
  if (entries.length) {
    const filters: Record<string, FilterDto> = {}
    entries.forEach(([key, value]) => {
      console.log(value)
      switch (true) {
        case ('condition1' in value): // there is two conditions
          delete value.conditions
          filters[key] = value as FilterDto
          break
        case value.filterType === 'date':
        {
          const v = value as DateFilterModel
          filters[key] = {
            filterType: v.filterType as string,
            condition1: {
              filter: v.dateFrom as string,
              filterTo: v.dateTo,
              type: v.type,
            } as DateFilterConditionDto,
          }
          break
        }
        case value.filterType === 'set':
        {
          const v = value as SetFilterModel
          filters[key] = {
            filterType: v.filterType as string,
            condition1: {
              filter: v.values,
            } as EnumFilterConditionDto,
          }
          break
        }
        case value.filterType === 'number': {
          const v = value as NumberFilterModel
          filters[key] = {
            filterType: v.filterType as string,
            condition1: {
              filter: v.filter,
              type: v.type,
            } as NumberFilterConditionDto,
          }
          break
        }
        default:
        {
          const v = value as TextFilterModel
          filters[key] = {
            filterType: v.filterType as string,
            condition1: {
              filter: v.filter,
              type: v.type,
            } as TextFilterConditionDto,
          }
          break
        }
      }
    })
    return filters as Record<keyof T, FilterDto>
  } else {
    return null
  }
}

export const backendFilterToAggFilter = (filters: Record<string, FilterDto>): FilterModel => {
  const entries = Object.entries(filters)
  if (entries.length) {
    const aggFilters: FilterModel = {}
    entries.forEach(([key, value]) => {
      if (value.condition2) {
        aggFilters[key] = filters[key]
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
