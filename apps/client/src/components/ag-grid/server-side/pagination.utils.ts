import type { FilterDto, SortDto } from '@biblio-num/shared'
import { type SortModelItem } from 'ag-grid-community'

const fieldTypesDict = {
  string: 'agTextColumnFilter',
  number: 'agNumberColumnFilter',
  date: 'agDateColumnFilter',
  boolean: 'agSetColumnFilter',
  default: 'agTextColumnFilter',
} as const

// TODO: use FieldType but enum from library doesnt work in front.
export const fromFieldTypeToAgGridFilter = (fieldType: keyof typeof fieldTypesDict) => fieldTypesDict[fieldType] || fieldTypesDict.default

export const fromAggToBackendSort = (sortModel: SortModelItem[]): SortDto[] => {
  return sortModel.map((sort) => ({
    key: sort.colId,
    order: sort.sort === 'asc' ? 'ASC' : 'DESC',
  }))
}

export const fromAggToBackendFilter = <T>(filterModel: Record<string, any>): Record<keyof T, FilterDto> | null => {
  const entries = Object.entries(filterModel)
  if (entries.length) {
    const filters: Record<string, FilterDto> = {}
    entries.forEach(([key, value]) => {
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
                filter: value.filter,
                type: value.type,
              },
        }
      } else {
        filters[key] = value
      }
    })
    return filters as Record<keyof T, FilterDto>
  } else {
    return null
  }
}

export const backendFilterToAggFilter = (filters: Record<string, FilterDto>): Record<string, any> => {
  const entries = Object.entries(filters)
  if (entries.length) {
    const aggFilters: Record<string, any> = {}
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
