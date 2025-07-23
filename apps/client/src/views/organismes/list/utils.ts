import type { INumbersFilterCondition, IOrganisme, IPaginated } from '@biblio-num/shared'

export const EMPTY_RESULT: IPaginated<IOrganisme> = { data: [], total: 0 }

const isEmpty = (values: unknown[]): boolean => {
  if (!values?.length) {
    return true
  }
  const conditionValues = values.filter((value) => value != null && String(value).trim() !== '')
  return conditionValues.length === 0
}

export const isEmptyYearsFilter = (filter: INumbersFilterCondition): boolean => {
  return !filter.includeEmpty && isEmpty(filter.filter || [])
}

export const isEmptySetFilter = (filter: any): boolean => {
  return filter.filterType === 'set' && isEmpty(filter.condition1?.filter || [])
}
