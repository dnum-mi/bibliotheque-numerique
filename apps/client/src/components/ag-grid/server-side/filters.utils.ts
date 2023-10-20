import { type IFilterDef } from 'ag-grid-community'
import type { FormatFunctionRefKeys } from '@biblio-num/shared'

import { DossierState } from '../../../utils'
import StatusBadgesRenderer from '../../Badges/StatusBadgesRenderer.vue'
import type { Component } from 'vue'

const fieldTypesDict = {
  file: 'agTextColumnFilter',
  string: 'agTextColumnFilter',
  number: 'agNumberColumnFilter',
  date: 'agDateColumnFilter',
  boolean: 'agSetColumnFilter',
  enum: 'agSetColumnFilter',
  default: 'agTextColumnFilter',
} as const

export const filterEnumvalues:Record<string, string[]> = {
  status: Object.keys(DossierState),
}

export const filterCellRender: Record<string, Component> = {
  status: StatusBadgesRenderer,
}

// TODO: use FieldType but enum from library doesn't work in front.
export const fromFieldTypeToAgGridFilter = (fieldType: keyof typeof fieldTypesDict, formatFunctionRef: FormatFunctionRefKeys) => {
  const filter:IFilterDef = {
    filter: fieldTypesDict[fieldType] || fieldTypesDict.default,
  }

  const filterValues: string[] = filterEnumvalues[formatFunctionRef]

  if (fieldType === 'enum' && filterValues) {
    filter.filterParams = {
      values: filterValues,
      suppressMiniFilter: true,
    }

    if (filterCellRender[formatFunctionRef]) {
      filter.filterParams.cellRenderer = filterCellRender[formatFunctionRef]
    }
  }
  return filter
}
