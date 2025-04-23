import { localeTextAgGrid } from './ag-grid-fr-dictionnary.ts'
import { agGridFilterDict } from '@/shared/types'

export const filterParamsDate = {
  comparator: (filterLocalDateAtMidnight: Date, cellValue: string) => {
    if (cellValue == null) {
      return -1
    }
    const cellDate = new Date(cellValue)
    if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
      return 0
    }
    if (cellDate < filterLocalDateAtMidnight) {
      return -1
    }
    if (cellDate > filterLocalDateAtMidnight) {
      return 1
    }
  },
  browserDatePicker: true,
}

export const filterToApply = {
  [agGridFilterDict.DATE]: {
    filter: 'agDateColumnFilter',
    filterParams: filterParamsDate,
  },
  [agGridFilterDict.TEXT]: {
    filter: 'agTextColumnFilter',
  },
  [agGridFilterDict.NUMBER]: {
    filter: 'agNumberColumnFilter',
  },
  [agGridFilterDict.MULTI_VALUE]: {
    filter: 'agSetColumnFilter',
  },
  [agGridFilterDict.MULTI_VALUE_NUMBER]: {
    filter: 'agNumberColumnFilter',
    filterParams: {
      filterOptions: [
        {
          displayKey: 'equalsArray',
          displayName: localeTextAgGrid.equals,
          predicate: ([filterValue]: [number], cellValues: number[]) => {
            return cellValues?.filter(cellValue => cellValue === filterValue).length > 0
          },
        },
        {
          displayKey: 'notEqualArray',
          displayName: localeTextAgGrid.notEqual,
          predicate: ([filterValue]: [number], cellValues: number[]) => {
            return cellValues?.filter(cellValue => cellValue !== filterValue).length > 0
          },
        },
        {
          displayKey: 'lessThanArray',
          displayName: localeTextAgGrid.lessThan,
          predicate: ([filterValue]: [number], cellValues: number[]) => {
            return cellValues?.filter(cellValue => cellValue < filterValue).length > 0
          },
        },
        {
          displayKey: 'lessThanOrEqualArray',
          displayName: localeTextAgGrid.lessThanOrEqual,
          predicate: ([filterValue]: [number], cellValues: number[]) => {
            return cellValues?.filter(cellValue => cellValue <= filterValue).length > 0
          },
        },
        {
          displayKey: 'greaterThanArray',
          displayName: localeTextAgGrid.greaterThan,
          predicate: ([filterValue]: [number], cellValues: number[]) => {
            return cellValues?.filter(cellValue => cellValue > filterValue).length > 0
          },
        },
        {
          displayKey: 'greaterThanOrEqualArray',
          displayName: localeTextAgGrid.greaterThanOrEqual,
          predicate: ([filterValue]: [number], cellValues: number[]) => {
            return cellValues?.filter(cellValue => cellValue >= filterValue).length > 0
          },
        },
        {
          displayKey: 'inRangeArray',
          displayName: localeTextAgGrid.inRange,
          predicate: ([filterValue1, filterValue2]: [number, number], cellValues: number[]) => {
            return cellValues?.filter(cellValue => (cellValue >= filterValue1) && (cellValue <= filterValue2)).length > 0
          },
          numberOfInputs: 2,
        },
        {
          displayKey: 'blankArray',
          displayName: localeTextAgGrid.blank,
          predicate: ([_]: [number], cellValues: number[]) => {
            return (cellValues === null || cellValues === undefined) || cellValues.length === 0 || cellValues.filter(cellValue => cellValue === null || cellValue === undefined).length > 0
          },
          numberOfInputs: 0,
        },
      ],
    },
  },
  [agGridFilterDict.FILE]: {
    filter: false,
  },
}
