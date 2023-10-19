import { FilterNumberDto } from './number.filter.dto'
import { FilterDateDto } from './date.filter.dto'
import { FilterTextDto } from './string.filter.dto'
import { FilterEnumDto } from './enum.filter.dto'

export type FilterDto = FilterTextDto | FilterDateDto | FilterNumberDto | FilterEnumDto;
