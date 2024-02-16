import {
  IsDateString,
  IsDefined,
  IsEnum,
  IsOptional, ValidateIf,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { DateRange, DateRangeKeys, IDateFilterCondition, IFilterDate } from '@biblio-num/shared-utils'

export const DateFilterConditions = {
  Equals: 'equals',
  NotEqual: 'notEqual',
  LessThan: 'lessThan',
  GreaterThan: 'greaterThan',
  Blank: 'blank',
  NotBlank: 'notBlank',
  Between: 'inRange',
  Since: 'since',
}

export type DateFilterConditionsKeys =
  (typeof DateFilterConditions)[keyof typeof DateFilterConditions]

export class DateFilterConditionDto implements IDateFilterCondition {
  @IsDefined()
  @IsEnum(DateFilterConditions)
  type: DateFilterConditionsKeys

  @IsOptional()
  @IsEnum(DateRange)
  sinceWhen?: DateRangeKeys

  @ValidateIf((o) => o.type !== DateFilterConditions.Since &&
    o.type !== DateFilterConditions.Blank &&
    o.type !== DateFilterConditions.NotBlank)
  @IsDefined()
  @IsDateString()
  filter: null | string

  @IsOptional()
  @IsDateString()
  filterTo?: null | string
}

export class FilterDateDto implements IFilterDate {
  filterType: 'date'

  @IsDefined()
  @ValidateNested()
  @Type(() => DateFilterConditionDto)
  condition1: DateFilterConditionDto

  @IsOptional()
  @ValidateNested()
  @Type(() => DateFilterConditionDto)
  condition2?: DateFilterConditionDto

  @IsOptional()
  @IsEnum(['AND', 'OR'])
  operator?: 'AND' | 'OR'
}
