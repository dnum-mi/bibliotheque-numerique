import {
  IsArray,
  IsBoolean,
  IsDefined,
  IsIn,
  IsString,
  ValidateNested,
} from 'class-validator'
import { IFilterStrings, IStringsFilterCondition } from '@biblio-num/shared'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class StringsFilterConditionDto implements IStringsFilterCondition {
  type: undefined

  @ApiProperty({
    description: 'Doit-on inclure les tableaux vide',
  })
  @IsBoolean()
  includeEmpty: boolean

  @ApiProperty({
    description: 'Liste de chaînes devant être présent dans le tableau',
  })
  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  filter: string[]
}

export class FilterStringsDto implements IFilterStrings {
  @ApiProperty({
    description: 'identification du type de filter: Strings',
  })
  @IsIn(['strings'])
  filterType: 'strings'

  @ApiProperty({
    description: 'Première condition de filtre de nombres',
  })
  @IsDefined()
  @ValidateNested()
  @Type(() => StringsFilterConditionDto)
  condition1: StringsFilterConditionDto

  operator: undefined
  condition2: undefined
}
