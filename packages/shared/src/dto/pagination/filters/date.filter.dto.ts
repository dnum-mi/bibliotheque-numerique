import { IsDate, IsDateString, IsDefined, IsEnum, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export const DateFilterConditions = {
  Equals: 'equals',
  NotEqual: 'notEqual',
  LessThan: 'lessThan',
  GreaterThan: 'greaterThan',
}

export type DateFilterConditionsKeys = (typeof DateFilterConditions)[keyof typeof DateFilterConditions];

export class DateFilterConditionDto {
  @IsDefined()
  @IsEnum(DateFilterConditions)
  type: DateFilterConditionsKeys

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
