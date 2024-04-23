import { IsDefined, IsEnum, IsIn, IsNumber, IsOptional, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { IFilterNumber, INumberFilterCondition } from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'

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
  @ApiProperty({
    description: 'Clef de comparaison de nombre',
  })
  @IsDefined()
  @IsEnum(NumberFilterConditions)
  type: NumberFilterConditionsKeys

  @ApiProperty({
    description: 'Nombre à comparer',
  })
  @IsDefined()
  @IsNumber()
  filter: number

  @ApiProperty({
    description: 'Nombre à comparer avec',
  })
  @IsOptional()
  @IsNumber()
  filterTo?: number
}

export class FilterNumberDto implements IFilterNumber {
  @ApiProperty({
    description: 'identification du type de filter: nombre',
  })
  @IsIn(['number'])
  filterType: 'number'

  @ApiProperty({
    description: 'Première condition de filtre de nombre',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => NumberFilterConditionDto)
  condition1: NumberFilterConditionDto

  @ApiProperty({
    description: 'Éventuelle deuxième condition de filtre de nombre',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NumberFilterConditionDto)
  condition2?: NumberFilterConditionDto

  @ApiProperty({
    description: 'Opérateur de liaison logique pour les deux conditions',
  })
  @IsOptional()
  @IsEnum(['AND', 'OR'])
  operator?: 'AND' | 'OR'
}
