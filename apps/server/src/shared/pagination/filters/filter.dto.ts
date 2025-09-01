import { FilterNumberDto, NumberFilterConditionDto } from './number.filter.dto'
import { DateFilterConditionDto, FilterDateDto } from './date.filter.dto'
import { FilterTextDto, TextFilterConditionDto } from './string.filter.dto'
import { EnumFilterConditionDto, FilterEnumDto } from './enum.filter.dto'
import {
  FilterNumbersDto,
  NumbersFilterConditionDto,
} from '@/shared/pagination/filters/numbers.filter.dto'

export type FilterDto =
  | FilterTextDto
  | FilterDateDto
  | FilterNumberDto
  | FilterNumbersDto
  | FilterEnumDto
export type FilterConditionDto =
  | TextFilterConditionDto
  | NumberFilterConditionDto
  | NumbersFilterConditionDto
  | EnumFilterConditionDto
  | DateFilterConditionDto
