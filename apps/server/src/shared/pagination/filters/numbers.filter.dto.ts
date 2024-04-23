import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsNumber,
  ValidateNested,
} from 'class-validator'
import { IFilterNumbers } from '@biblio-num/shared/types/pagination/numbers.filter.interface'
import { INumbersFilterCondition } from '@biblio-num/shared'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class NumbersFilterConditionDto implements INumbersFilterCondition {
  type: undefined

  @ApiProperty({
    description: 'Doit-on inclure les tableaux vide',
  })
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

  operator: undefined
  condition2: undefined
}
