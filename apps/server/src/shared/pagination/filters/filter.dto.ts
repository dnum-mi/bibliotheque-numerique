import { FilterNumberDto, NumberFilterConditionDto } from './number.filter.dto'
import { DateFilterConditionDto, FilterDateDto } from './date.filter.dto'
import { FilterTextDto, TextFilterConditionDto } from './string.filter.dto'
import { EnumFilterConditionDto, FilterEnumDto } from './enum.filter.dto'

export type FilterDto = FilterTextDto | FilterDateDto | FilterNumberDto | FilterEnumDto;
export type FilterConditionDto = TextFilterConditionDto |
  NumberFilterConditionDto |
  EnumFilterConditionDto |
  DateFilterConditionDto
