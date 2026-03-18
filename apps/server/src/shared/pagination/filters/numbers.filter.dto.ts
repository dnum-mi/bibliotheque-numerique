import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator'
import { IFilterNumbers } from '@biblio-num/shared/types/pagination/numbers.filter.interface'
import { INumbersFilterCondition } from '@biblio-num/shared'
import { Type } from 'class-transformer'
import { ApiHideProperty, ApiProperty } from '@nestjs/swagger'

export class NumbersFilterConditionDto implements INumbersFilterCondition {
  @ApiHideProperty()
  type: undefined

  @ApiProperty({
    description: 'Doit-on inclure les tableaux vide',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  includeEmpty: boolean

  @ApiProperty({
    description: 'Liste de nombre devant être présent dans le tableau',
  })
  @IsDefined()
  @IsArray()
  @IsNumber({}, { each: true })
  filter: number[]
}

export class FilterNumbersDto implements IFilterNumbers {
  @ApiProperty({
    description: 'identification du type de filter: numbers',
  })
  @IsIn(['numbers'])
  filterType: 'numbers'

  @ApiProperty({
    description: 'Première condition de filtre de nombres',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => NumbersFilterConditionDto)
  condition1: NumbersFilterConditionDto

  @ApiHideProperty()
  operator: undefined

  @ApiHideProperty()
  condition2: undefined
}
