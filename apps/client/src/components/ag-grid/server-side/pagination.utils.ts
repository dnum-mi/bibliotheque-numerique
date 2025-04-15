import type {
  IDateFilterCondition,
  IFilterDate,
  IEnumFilterCondition,
  IFilter,
  INumberFilterCondition,
  INumbersFilterCondition,
  IPaginated,
  IPagination,
  ISort,
  ITextFilterCondition,
  IFilterEnum,
  IFilterNumber,
  IFilterText,
} from '@biblio-num/shared'
import type {
  DateFilterModel,
  ICombinedSimpleModel,
  IMultiFilterModel,
  JoinOperator,
  NumberFilterModel,
  SetFilterModel,
  SortModelItem,
  TextFilterModel,
} from 'ag-grid-community'

import type { AgGridCommon } from 'ag-grid-community/dist/types/core/interfaces/iCommon'
import type { ISimpleFilterModel } from 'ag-grid-enterprise'

export type ApiCall<T> = (params: IPagination<T>) => Promise<IPaginated<T>>

type FilterModel = Parameters<AgGridCommon<unknown, unknown>['api']['setFilterModel']>[0]

const _fromAggDateFilterToBackendFilterOfCondition = (filter: DateFilterModel): IDateFilterCondition => ({
  filter: filter.dateFrom,
  filterTo: filter.dateTo,
  type: filter.type,
} as IDateFilterCondition)

const _fromAggDateFilterToBackendFilter = (filter: DateFilterModel | ICombinedSimpleModel<DateFilterModel>): IFilter => {
  if ((filter as ICombinedSimpleModel<DateFilterModel>).operator) {
    const combinedFilter = filter as ICombinedSimpleModel<DateFilterModel>
    return {
      filterType: 'date',
      condition1: _fromAggDateFilterToBackendFilterOfCondition(combinedFilter.condition1),
      condition2: _fromAggDateFilterToBackendFilterOfCondition(combinedFilter.condition2),
      operator: combinedFilter.operator,
    }
  } else {
    return ({
      filterType: 'date',
      condition1: _fromAggDateFilterToBackendFilterOfCondition(filter as DateFilterModel),
    })
  }
}

const _fromCustomNumbersFilterToBackendFilter = (filter: INumbersFilterCondition): IFilter => ({
  filterType: 'numbers',
  condition1: filter,
})

const _fromAggSetFilterToBackendFilter = (filter: SetFilterModel): IFilter => ({
  filterType: 'set',
  condition1: {
    filter: filter.values && filter.values.length > 0 ? filter.values : [''],
  } as IEnumFilterCondition,
})

const _fromAggNumberFilterToBackendFilter = (filter: NumberFilterModel): IFilter => ({
  filterType: 'number',
  condition1: {
    filter: filter.filter,
    type: filter.type,
  } as INumberFilterCondition,
})

const _fromAggStringFilterToBackendFilter = (filter: TextFilterModel): IFilter => ({
  filterType: 'text',
  condition1: {
    filter: filter.filter,
    type: filter.type,
  } as ITextFilterCondition,
})

// multi filter now is only used for date
const _fromAggMultiFilterToBackendFilter = (filter: IMultiFilterModel): IFilter => {
  const sinceValue = filter.filterModels?.[1]?.value
  if (sinceValue) {
    return {
      filterType: 'date',
      condition1: {
        sinceWhen: sinceValue,
        type: 'since',
      } as IDateFilterCondition,
    }
  } else {
    return _fromAggDateFilterToBackendFilter(filter.filterModels?.[0])
  }
}

export const fromAggToBackendFilter = <T>(filterModel: Record<string, FilterModel>, allowedColumnIds: string[]): Record<keyof T, IFilter> | null => {
  const entries = Object.entries(filterModel).filter(entry => allowedColumnIds.includes(entry[0]))
  if (entries.length) {
    const filters: Record<string, IFilter> = {}
    entries.forEach(([key, value]) => {
      switch (true) {
        case ('condition1' in value): // there is two conditions
          delete value.conditions
          filters[key] = value as IFilter
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
        case value.filterType === 'numbers': {
          filters[key] = _fromCustomNumbersFilterToBackendFilter(value as IMultiFilterModel)
          break
        }
        case value.filterType === 'text':
        default: {
          filters[key] = _fromAggStringFilterToBackendFilter(value as TextFilterModel)
          break
        }
      }
    })
    return filters as Record<keyof T, IFilter>
  } else {
    return null
  }
}

export const fromAggToBackendSort = (sortModel: SortModelItem[], allowedColumnIds: string[]): ISort[] => {
  return sortModel
    .filter((sort) => allowedColumnIds.includes(sort.colId))
    .map((sort) => ({
      key: sort.colId,
      order: sort.sort === 'asc' ? 'ASC' : 'DESC',
    }))
}

const _aggFilterToAggFilterByDate = (filter: IFilterDate): IMultiFilterModel => ({
  filterType: 'multi',
  filterModels: filter.condition1.type !== 'since'
    ? [
        {
          filterType: 'date',
          ...('condition2' in filter
            ? {
                conditions: [{
                  filterType: 'date',
                  type: filter.condition1.type,
                  dateFrom: filter.condition1.filter,
                  dateTo: filter.condition1.filterTo,
                }, {
                  filterType: 'date',
                  type: filter.condition2?.type,
                  dateFrom: filter.condition2?.filter,
                  dateTo: filter.condition2?.filterTo,
                }],
                operator: filter.operator as unknown as JoinOperator,
              }
            : {
                type: filter.condition1.type,
                dateFrom: filter.condition1.filter,
                dateTo: filter.condition1.filterTo,
              }),
        },
        null,
      ]
    : [
        null,
        {
          value: filter.condition1.sinceWhen,
        },
      ],
})

const _aggFilterToAggFilterBySet = (filter: IFilterEnum): SetFilterModel | ICombinedSimpleModel<SetFilterModel> => ({
  filterType: 'set',
  values: filter.condition1.filter,
})

const _aggFilterToAggFilterByNumber = (filter: IFilterNumber): NumberFilterModel | ICombinedSimpleModel<NumberFilterModel> => ({
  filterType: 'number',
  ...('condition2' in filter
    ? {
        conditions: [{
          filterType: 'number',
          ...filter.condition1,
        }, {
          filterType: 'number',
          ...filter.condition2,
        }],
        operator: filter.operator as unknown as JoinOperator,
      }
    : {
        type: filter.condition1.type as ISimpleFilterModel['type'],
        filter: filter.condition1.filter,
        filterTo: filter.condition1.filterTo,
      }),
})

const _aggFilterToAggFilterByText = (filter: IFilterText): TextFilterModel | ICombinedSimpleModel<TextFilterModel> => ({
  filterType: 'text',
  ...('condition2' in filter
    ? {
        conditions: [{
          filterType: 'text',
          type: filter.condition1.type as ISimpleFilterModel['type'],
          filter: filter.condition1.filter,
        }, {
          filterType: 'text',
          type: filter.condition2?.type as ISimpleFilterModel['type'],
          filter: filter.condition2?.filter,
        }],
        operator: filter.operator as unknown as JoinOperator,
      }
    : {
        type: filter.condition1.type as ISimpleFilterModel['type'],
        filter: filter.condition1.filter,
      }),
})

const _transformToAggFilter = (filter: IFilter): FilterModel => {
  switch (filter.filterType) {
    case 'date':
      return _aggFilterToAggFilterByDate(filter as IFilterDate)
    case 'set':
      return _aggFilterToAggFilterBySet(filter as IFilterEnum)
    case 'number':
      return _aggFilterToAggFilterByNumber(filter as IFilterNumber)
    case 'text':
      return _aggFilterToAggFilterByText(filter as IFilterText)
    default:
      return {
        filterType: filter.filterType,
        ...('condition2' in filter
          ? {
              conditions: [
                {
                  filterType: filter.filterType,
                  ...filter.condition1,
                },
                {
                  filterType: filter.filterType,
                  ...(filter.condition2 || {}),
                },
              ],
              operator: filter.operator as unknown as JoinOperator,
            }
          : { filterModel: filter.condition1 }),
      }
  }
}

export const backendFilterToAggFilter = (filters: Record<string, IFilter>): FilterModel => {
  const entries = Object.entries(filters)
    .map(([key, value]) => [key, _transformToAggFilter(value)])

  return Object.fromEntries(entries) as FilterModel
}
