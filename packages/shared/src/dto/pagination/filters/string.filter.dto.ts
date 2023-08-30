import { IsDefined, IsEnum, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export const TextFilterConditions = {
  Contains: 'contains',
  NotContains: 'notContains',
  StartsWith: 'startsWith',
  EndsWith: 'endsWith',
  Blank: 'blank',
  NotBlank: 'notBlank',
}

export type TextFilterConditionsKeys =
  (typeof TextFilterConditions)[keyof typeof TextFilterConditions];

export class TextFilterConditionDto {
  @IsDefined()
  @IsEnum(TextFilterConditions)
  type: TextFilterConditionsKeys

  @IsDefined()
  filter: string
}

export class FilterTextDto {
  filterType = 'text'

  @IsDefined()
  @ValidateNested()
  @Type(() => TextFilterConditionDto)
  condition1: TextFilterConditionDto

  @IsOptional()
  @ValidateNested()
  @Type(() => TextFilterConditionDto)
  condition2?: TextFilterConditionDto

  @IsOptional()
  @IsEnum(['AND', 'OR'])
  operator?: 'AND' | 'OR'
}
