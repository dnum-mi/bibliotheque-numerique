import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsNumber,
  ValidateNested,
} from 'class-validator'
import { IFilterNumbers } from '@biblio-num/shared/types/pagination/numbers.filter.interface'
import { INumbersFilterCondition } from '@biblio-num/shared'
import { Type } from 'class-transformer'

export class NumbersFilterConditionDto implements INumbersFilterCondition {
  type: undefined

  @IsBoolean()
  includeEmpty: boolean

  @IsDefined()
  @IsArray()
  @IsNumber({}, { each: true })
  filter: number[]
}

export class FilterNumbersDto implements IFilterNumbers {
  @IsIn(['numbers'])
  filterType: 'numbers'

  @IsDefined()
  @ValidateNested()
  @Type(() => NumbersFilterConditionDto)
  condition1: NumbersFilterConditionDto

  operator: undefined
  condition2: undefined
}
