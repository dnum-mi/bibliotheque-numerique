import type { FilterDto, SortDto } from '@biblio-num/shared'

import { type SortModelItem } from 'ag-grid-community'
import type { AgGridCommon } from 'ag-grid-community/dist/lib/interfaces/iCommon'

const fieldTypesDict = {
  file: 'agTextColumnFilter',
  string: 'agTextColumnFilter',
  number: 'agNumberColumnFilter',
  date: 'agDateColumnFilter',
  boolean: 'agSetColumnFilter',
  default: 'agTextColumnFilter',
} as const

// TODO: use FieldType but enum from library doesn't work in front.
export const getAgGridFilterFromFieldType = (fieldType?: keyof typeof fieldTypesDict) => (fieldType && fieldTypesDict[fieldType]) || fieldTypesDict.default

export const fromAggToBackendSort = (sortModel: SortModelItem[]): SortDto[] => {
  return sortModel.map((sort) => ({
    key: sort.colId,
    order: sort.sort === 'asc' ? 'ASC' : 'DESC',
  }))
}

type FilterModel = Parameters<AgGridCommon<unknown, unknown>['api']['setFilterModel']>[0]
export const fromAggToBackendFilter = <T>(filterModel: FilterModel): Record<keyof T, FilterDto> | null => {
  const entries = Object.entries(filterModel)
  if (entries.length) {
    const filters: Record<string, FilterDto> = {}
    entries.forEach(([key, value]: [string, FilterModel]) => {
      if (!value.condition1) {
        filters[key] = {
          filterType: value.filterType,
          condition1: value.filterType === 'date'
            ? {
                filter: value.dateFrom,
                filterTo: value.dateTo,
                type: value.type,
              }
            : {
                filter: value.filter ?? value.values,
                type: value.type,
              },
        }
      } else {
        filters[key] = value as FilterDto
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
