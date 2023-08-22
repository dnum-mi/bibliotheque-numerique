import { IsDefined, IsEnum, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

const DateFilterConditions = {
  Equals: 'equals',
  NotEqual: 'notEqual',
  LessThan: 'lessThan',
  GreaterThan: 'greaterThan',
}

type DateFilterConditionsKeys = (typeof DateFilterConditions)[keyof typeof DateFilterConditions];

export class DateFilterConditionDto {
  @IsDefined()
  @IsEnum(DateFilterConditions)
  type: DateFilterConditionsKeys

  @IsDefined()
  filter: number

  @IsOptional()
  filterTo?: number
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
