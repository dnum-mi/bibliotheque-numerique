import { FilterMatchMode } from '@primevue/core/api'

//#region 📍------ CONSTANTES ------📍

export const SET_FILTER_TYPES = ['agSetColumnFilter', 'agBooleanColumnFilter'] as const

// Liste des opérateurs valides pour l'API
export const VALID_API_OPERATORS = [
  'greaterThan',
  'lessThan',
  'notEqual',
  'equals',
  'inRange',
  'contains',
  'startsWith',
  'endsWith',
  'blank',
  'notBlank',
]

//#endregion

//#region 📍------ MAPPINGS ------ 📍

// Init: AgGrid Config -> PrimeVue Filter Mode
export const agGridFilterToDataTableFilter: Record<string, string> = {
  agTextColumnFilter: FilterMatchMode.CONTAINS,
  agNumberColumnFilter: FilterMatchMode.EQUALS,
  agMultiColumnFilter: FilterMatchMode.DATE_IS,
  agDateColumnFilter: FilterMatchMode.DATE_IS,
  agSetColumnFilter: FilterMatchMode.EQUALS,
  agBooleanColumnFilter: FilterMatchMode.IN,
  customNumbersFilter: FilterMatchMode.EQUALS,
  customStringsFilter: FilterMatchMode.EQUALS,
}

// Type Detection: AgGrid Filter -> PrimeVue DataType
export const agGridFilterToDataTableDataType: Record<string, string | undefined> = {
  agTextColumnFilter: undefined,
  agNumberColumnFilter: 'numeric',
  agMultiColumnFilter: 'date',
  agDateColumnFilter: 'date',
  agSetColumnFilter: undefined,
  agBooleanColumnFilter: 'boolean',
}

// API Output: PrimeVue -> AgGrid Operators
export const dateMatchModeToAgGrid: Record<string, string> = {
  [FilterMatchMode.DATE_IS]: 'equals',
  [FilterMatchMode.DATE_IS_NOT]: 'notEqual',
  [FilterMatchMode.DATE_BEFORE]: 'lessThan',
  [FilterMatchMode.DATE_AFTER]: 'greaterThan',
}

export const numberMatchModeToAgGrid: Record<string, string> = {
  [FilterMatchMode.EQUALS]: 'equals',
  [FilterMatchMode.NOT_EQUALS]: 'notEqual',
  [FilterMatchMode.GREATER_THAN]: 'greaterThan',
  [FilterMatchMode.LESS_THAN]: 'lessThan',
  [FilterMatchMode.GREATER_THAN_OR_EQUAL_TO]: 'greaterThanOrEqual',
  [FilterMatchMode.LESS_THAN_OR_EQUAL_TO]: 'lessThanOrEqual',
}

// Restore Input: AgGrid -> PrimeVue Operators
export const agGridToPrimeVueDateMode: Record<string, string> = {
  equals: FilterMatchMode.DATE_IS,
  notEqual: FilterMatchMode.DATE_IS_NOT,
  greaterThan: FilterMatchMode.DATE_AFTER,
  lessThan: FilterMatchMode.DATE_BEFORE,
  gt: FilterMatchMode.DATE_AFTER,
  lt: FilterMatchMode.DATE_BEFORE,
}

export const agGridToPrimeVueNumberMode: Record<string, string> = {
  equals: FilterMatchMode.EQUALS,
  notEqual: FilterMatchMode.NOT_EQUALS,
  greaterThan: FilterMatchMode.GREATER_THAN,
  greaterThanOrEqual: FilterMatchMode.GREATER_THAN_OR_EQUAL_TO,
  lessThan: FilterMatchMode.LESS_THAN,
  lessThanOrEqual: FilterMatchMode.LESS_THAN_OR_EQUAL_TO,
}

//#endregion
