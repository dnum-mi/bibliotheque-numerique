import { IsDefined, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class EnumFilterConditionDto {
  type?: undefined
  @IsDefined()
  filter: string[]
}

export class FilterEnumDto {
  filterType = 'set'

  @IsDefined()
  @ValidateNested()
  @Type(() => EnumFilterConditionDto)
  condition1: EnumFilterConditionDto

  condition2?: undefined
  operator?: undefined
}
