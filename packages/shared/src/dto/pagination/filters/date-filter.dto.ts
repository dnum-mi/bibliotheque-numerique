import { IsArray, IsDate, IsDefined, IsEnum, IsNumber, IsString } from 'class-validator'

export class DateFilter<T> {
  @IsDefined()
  @IsString()
  key: keyof T

  @IsDefined()
  @IsDate()
  value: Date

  @IsDefined()
  @IsString()
  @IsEnum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte'])
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
}

export class DateArrayFilter<T> {
  @IsDefined()
  @IsString()
  key: keyof T

  @IsDefined()
  @IsArray()
  @IsDate({ each: true })
  values: Date[]

  @IsDefined()
  @IsString()
  @IsEnum(['in', 'nin'])
  operator: 'in' | 'nin'
}
