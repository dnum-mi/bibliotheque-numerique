import { IsDefined, IsEnum, IsIn, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { IFilterText, ITextFilterCondition } from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'

export const TextFilterConditions = {
  Contains: 'contains',
  NotContains: 'notContains',
  StartsWith: 'startsWith',
  EndsWith: 'endsWith',
  Blank: 'blank',
  NotBlank: 'notBlank',
  NotEqual: 'notEqual',
}

export type TextFilterConditionsKeys =
  (typeof TextFilterConditions)[keyof typeof TextFilterConditions];

export class TextFilterConditionDto implements ITextFilterCondition {
  @ApiProperty({
    description: 'Clef de comparaison de texte',
  })
  @IsDefined()
  @IsEnum(TextFilterConditions)
  type: TextFilterConditionsKeys

  @ApiProperty({
    description: 'Text à comparer',
  })
  @IsOptional()
  filter?: string
}

export class FilterTextDto implements IFilterText {
  @ApiProperty({
    description: 'identification du type de filter: text',
  })
  @IsIn(['text'])
  filterType: 'text'

  @ApiProperty({
    description: 'Première condition de filtre de text',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => TextFilterConditionDto)
  condition1: TextFilterConditionDto

  @ApiProperty({
    description: 'Éventuelle deuxième condition de filtre de text',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TextFilterConditionDto)
  condition2?: TextFilterConditionDto

  @ApiProperty({
    description: 'Opérateur de liaison logique pour les deux conditions',
  })
  @IsOptional()
  @IsEnum(['AND', 'OR'])
  operator?: 'AND' | 'OR'
}
