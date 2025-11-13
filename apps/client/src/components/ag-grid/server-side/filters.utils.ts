import type { IFilterDef } from 'ag-grid-community'
import type { Component } from 'vue'

import { FormatFunctionRef, instructionTimeValues } from '@biblio-num/shared'
import type { FormatFunctionRefKeys } from '@biblio-num/shared'

import { DossierState } from '@/utils'
import StatusBadgesRenderer from '../../Badges/status/StatusBadgesRenderer.vue'
import DelayStateRenderer from '../../Badges/delay-state/DelayStateRenderer.vue'

const fieldTypesDict = {
  file: 'agTextColumnFilter',
  string: 'agTextColumnFilter',
  number: 'agNumberColumnFilter',
  date: 'agMultiColumnFilter',
  boolean: 'agSetColumnFilter',
  enum: 'agSetColumnFilter',
  default: 'agTextColumnFilter',
} as const

export const filterEnumvalues: Record<FormatFunctionRefKeys, string[]> = {
  [FormatFunctionRef.status]: Object.keys(DossierState),
  [FormatFunctionRef.delayStatus]: [...instructionTimeValues, ''],
} as const

export const filterCellRender: Record<FormatFunctionRefKeys, Component> = {
  [FormatFunctionRef.status]: markRaw(StatusBadgesRenderer),
  [FormatFunctionRef.delayStatus]: markRaw(DelayStateRenderer),
} as const

// TODO: use FieldType but enum from library doesn't work in front.
export const getAgGridFilterFromFieldType = (fieldType?: keyof typeof fieldTypesDict, formatFunctionRef?: FormatFunctionRefKeys): IFilterDef => {
  const filter: IFilterDef = {
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
    return filter
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
    return filter
  }

  if (fieldType === 'boolean') {
    filter.filterParams = {
      values: ['true', 'false'],
      valueFormatter: (params: { value: string }) => (params.value === 'true' ? 'Oui' : 'Non'),
      suppressMiniFilter: true,
    }

    return filter
  }

  if (fieldType === 'number') {
    filter.filterParams = {
      ...filter.filterParams,
      filterOptions: [
        'equals',
        'notEqual',
        'greaterThan',
        'greaterThanOrEqual',
        'lessThan',
        'lessThanOrEqual',
        'blank',
        'notBlank',
      ],
    }
  }

  return filter
}
