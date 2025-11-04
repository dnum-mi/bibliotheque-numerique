import type { INumbersFilterCondition, IPaginated, IStringsFilterCondition } from '@biblio-num/shared'

// Objet vide respectant la structure IPaginated : { data: T[], total: number }
export const EMPTY_RESULT: IPaginated<any> = { data: [], total: 0 }

const isEmpty = (values: unknown[]): boolean => {
  if (!values?.length) {
    return true
  }
  const conditionValues = values.filter((value) => value != null && String(value).trim() !== '')
  return conditionValues.length === 0
}

export const isEmptyListFilter = <T extends INumbersFilterCondition | IStringsFilterCondition>(filter: T): boolean => {
  return !filter.includeEmpty && isEmpty(filter.filter || [])
}

export const isEmptySetFilter = (filter: any): boolean => {
  return filter.filterType === 'set' && isEmpty(filter.condition1?.filter || [])
}
