import {
  IsDate,
  IsDateString,
  IsDefined,
  IsEnum,
  IsOptional, ValidateIf,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { DateRange, DateRangeKeys } from '../../../enums'

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

export class DateFilterConditionDto {
  @IsDefined()
  @IsEnum(DateFilterConditions)
  type: DateFilterConditionsKeys

  @IsOptional()
  @IsEnum(DateRange)
  sinceWhen?: DateRangeKeys

  @ValidateIf((o) => o.type !== DateFilterConditions.Since && o.type !== DateFilterConditions.Blank && o.type !== DateFilterConditions.NotBlank)
  @IsDefined()
  @IsDateString()
  filter: null | string

  @IsOptional()
  @IsDateString()
  filterTo?: null | string
}

export class FilterDateDto {
  filterType = 'date'

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
