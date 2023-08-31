import { IsDefined, IsEnum, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export const NumberFilterConditions = {
  Equals: 'equals',
  NotEqual: 'notEqual',
  LessThan: 'lessThan',
  LessThanOrEqual: 'lessThanOrEqual',
  GreaterThan: 'greaterThan',
  GreaterThanOrEqual: 'greaterThanOrEqual',
}

export type NumberFilterConditionsKeys =
  (typeof NumberFilterConditions)[keyof typeof NumberFilterConditions];

export class NumberFilterConditionDto {
  @IsDefined()
  @IsEnum(NumberFilterConditions)
  type: NumberFilterConditionsKeys

  @IsDefined()
  filter: number

  @IsOptional()
  filterTo?: number
}

export class FilterNumberDto {
  filterType = 'number'

  @IsDefined()
  @ValidateNested()
  @Type(() => NumberFilterConditionDto)
  condition1: NumberFilterConditionDto

  @IsOptional()
  @ValidateNested()
  @Type(() => NumberFilterConditionDto)
  condition2?: NumberFilterConditionDto

  @IsOptional()
  @IsEnum(['AND', 'OR'])
  operator?: 'AND' | 'OR'
}
