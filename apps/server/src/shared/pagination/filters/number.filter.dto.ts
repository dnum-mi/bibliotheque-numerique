import { IsDefined, IsEnum, IsNumber, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { IFilterNumber, INumberFilterCondition } from '@biblio-num/shared'

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

export class NumberFilterConditionDto implements INumberFilterCondition {
  @IsDefined()
  @IsEnum(NumberFilterConditions)
  type: NumberFilterConditionsKeys

  @IsDefined()
  @IsNumber()
  filter: number

  @IsOptional()
  @IsNumber()
  filterTo?: number
}

export class FilterNumberDto implements IFilterNumber {
  filterType: 'number'

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
