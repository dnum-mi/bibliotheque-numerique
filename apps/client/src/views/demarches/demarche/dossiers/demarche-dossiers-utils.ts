import type { FilterDto } from '@biblio-num/shared'

const fieldTypesDict = {
  string: 'agTextColumnFilter',
  number: 'agNumberColumnFilter',
  date: 'agDateColumnFilter',
  boolean: 'agSetColumnFilter',
  default: 'agTextColumnFilter',
} as const

// TODO: use FieldType but enum from library doesnt work in front.
export const fromFieldTypeToAgGridFilter = (fieldType: keyof typeof fieldTypesDict) => fieldTypesDict[fieldType] || fieldTypesDict.default

export const fromAggToBackendFilter = (filterModel: Record<string, any>): Record<string, FilterDto> | null => {
  const entries = Object.entries(filterModel)
  if (entries.length) {
    const filters: Record<string, FilterDto> = {}
    entries.forEach(([key, value]) => {
      if (!value.condition1) {
        filters[key] = {
          filterType: value.filterType,
          condition1: {
            filter: value.filter,
            type: value.type,
          },
        }
      } else {
        filters[key] = value
      }
    })
    return filters
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
