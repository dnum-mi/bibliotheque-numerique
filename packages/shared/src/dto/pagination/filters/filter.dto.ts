import { FilterNumberDto } from './number.filter.dto'
import { FilterDateDto } from './date.filter.dto'
import { FilterTextDto } from './string.filter.dto'

export type FilterDto = FilterTextDto | FilterDateDto | FilterNumberDto;
