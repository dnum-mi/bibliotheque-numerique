import {
  DateFilterConditions,
  DateRangeKeys,
  IUserFriendlyFilter,
  NumberFilterConditions,
  TextFilterConditions,
} from '@biblio-num/shared'
import { DateFilterConditionDto, FilterDto } from '@/shared/pagination/filters'
import { FiltersInCustomFilter } from '@/modules/custom-filters/objects/entities/custom-filter.entity'

export const dictionaryHumanReadableOperatorsNumber = {
  [NumberFilterConditions.Equals]: 'Égal à:',
  [NumberFilterConditions.NotEqual]: 'Différent de:',
  [NumberFilterConditions.LessThan]: 'Plus petit que:',
  [NumberFilterConditions.GreaterThan]: 'Plus grand que:',
  [NumberFilterConditions.LessThanOrEqual]: 'Plus petit ou égal à:',
  [NumberFilterConditions.GreaterThanOrEqual]: 'Plus grand ou égal à:',
}

// TODO: In_range, blank, no_blank
export const dictionaryHumanReadableOperatorsText = {
  [TextFilterConditions.Contains]: 'Contient le mot:',
  [TextFilterConditions.NotContains]: 'Ne contient pas le mot:',
  [TextFilterConditions.StartsWith]: 'Commence par le mot:',
  [TextFilterConditions.EndsWith]: 'Fini par le mot:',
  [TextFilterConditions.Blank]: 'Les non-renseignés',
  [TextFilterConditions.NotBlank]: 'Les renseignés',
}

// TODO: In_range, blank, no_blank
export const dictionaryHumanReadableOperatorsDate = {
  [DateFilterConditions.Equals]: 'Le:',
  [DateFilterConditions.NotEqual]: 'En dehors du:',
  [DateFilterConditions.LessThan]: 'Avant le:',
  [DateFilterConditions.GreaterThan]: 'Après le:',
  [DateFilterConditions.Since]: 'Depuis',
}

export const dictionnaryHumanReadableOperatorsEnum = {
  default: 'Contient: ',
}

// TODO: duplicata from front. Group it when we have two librairies
const rangeDictionary: Record<DateRangeKeys, string> = {
  TwentyFourHours: '24 heures',
  ThreeDays: '3 jours',
  OneWeek: '1 semaine',
  TwoWeeks: '2 semaines',
  OneMonth: '1 mois',
  ThreeMonths: '3 mois',
  SixMonths: '6 mois',
  OneYear: '1 an',
}

// TODO: In_range, blank, no_blank
export const dictionaryHumanReadableFilterType = {
  text: dictionaryHumanReadableOperatorsText,
  number: dictionaryHumanReadableOperatorsNumber,
  date: dictionaryHumanReadableOperatorsDate,
  enum: dictionnaryHumanReadableOperatorsEnum,
}
export const humanReadableOperator = (filterType, type): string =>
  dictionaryHumanReadableFilterType[filterType]?.[type || 'default'] || ''

export const humanReadableFilter = (filter: FilterDto): string => {
  return [filter.condition1, filter.condition2]
    .filter((c) => c)
    .map(
      (condition) =>
        `${humanReadableOperator(filter.filterType, condition.type)} ${
          condition.filter instanceof Array
            ? condition.filter.join(', ')
            : condition.filter ??
              rangeDictionary[(condition as DateFilterConditionDto).sinceWhen]
        }`,
    )
    .join(filter.operator ? (filter.operator === 'AND' ? ' et ' : ' ou ') : '')
}

export const fromCustomFilterToHumanReadableFilter = (
  ffc: FiltersInCustomFilter,
  mch: Record<string, string>,
): IUserFriendlyFilter[] => {
  return ffc
    ? Object.entries(ffc).map(([key, value]) => {
      return {
        label: mch[key] || key,
        value: humanReadableFilter(value),
      }
    })
    : []
}
