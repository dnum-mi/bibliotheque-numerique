import { BooleanFilter } from './boolean-filter.dto'
import { StringArrayFilter, StringFilter } from './string-filter.dto'
import { NumberArrayFilter, NumberFilter } from './number-filter.dto'
import { DateArrayFilter, DateFilter } from './date-filter.dto'

// TODO: find a way to have a class (to validate)
export type Filter<T> = BooleanFilter<T> | StringFilter<T> | StringArrayFilter<T> | NumberFilter<T> | NumberArrayFilter<T> | DateFilter<T> | DateArrayFilter<T>
