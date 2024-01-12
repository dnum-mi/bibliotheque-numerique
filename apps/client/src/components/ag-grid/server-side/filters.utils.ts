import { type IFilterDef } from 'ag-grid-community'
import type { FormatFunctionRefKeys } from '@biblio-num/shared'

import { DossierState } from '@/utils'
import StatusBadgesRenderer from '../../Badges/StatusBadgesRenderer.vue'
import type { Component } from 'vue'

const fieldTypesDict = {
  file: 'agTextColumnFilter',
  string: 'agTextColumnFilter',
  number: 'agNumberColumnFilter',
  date: 'agMultiColumnFilter',
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
export const getAgGridFilterFromFieldType = (fieldType?: keyof typeof fieldTypesDict, formatFunctionRef?: FormatFunctionRefKeys): IFilterDef => {
  const filter:IFilterDef = {
    filter: (fieldType && fieldTypesDict[fieldType]) || fieldTypesDict.default,
  }

  const filterValues: string[] | string | undefined = (formatFunctionRef && filterEnumvalues[formatFunctionRef])

  if (fieldType === 'enum' && filterValues) {
    filter.filterParams = {
      values: filterValues,
      suppressMiniFilter: true,
    }

    if (formatFunctionRef && filterCellRender[formatFunctionRef]) {
      filter.filterParams.cellRenderer = filterCellRender[formatFunctionRef]
    }
  }

  if (fieldType === 'date') {
    filter.filterParams = {
      filters: [
        {
          filter: 'agDateColumnFilter',
          display: 'accordion',
          title: 'Filtre par date',
        },
        {
          filter: 'customDateFilter',
          display: 'accordion',
          title: 'Filtre par période',
        },
      ],
    }
  }
  return filter
}
