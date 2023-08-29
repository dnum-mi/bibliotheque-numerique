import { IsBoolean, IsDefined, IsEnum, IsString } from 'class-validator'

export class BooleanFilter<T> {
  @IsDefined()
  @IsString()
  key: keyof T

  @IsDefined()
  @IsBoolean()
  value: boolean

  @IsDefined()
  @IsString()
  @IsEnum(['eq', 'neq'])
  operator: 'eq' | 'neq'
}
