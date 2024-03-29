import { ArrayNotEmpty, IsDefined, IsIn, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { IEnumFilterCondition, IFilterEnum } from '@biblio-num/shared'

export class EnumFilterConditionDto implements IEnumFilterCondition {
  type?: undefined

  @ArrayNotEmpty()
  @IsDefined()
  filter: string[]
}

export class FilterEnumDto implements IFilterEnum {
  @IsIn(['set'])
  filterType: 'set'

  @IsDefined()
  @ValidateNested()
  @Type(() => EnumFilterConditionDto)
  condition1: EnumFilterConditionDto

  condition2?: undefined
  operator?: undefined
}
