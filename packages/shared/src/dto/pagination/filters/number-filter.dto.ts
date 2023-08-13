import { IsArray, IsDefined, IsEnum, IsNumber, IsString } from 'class-validator'

export class NumberFilter<T> {
  @IsDefined()
  @IsString()
  key: keyof T

  @IsDefined()
  @IsNumber()
  value: number

  @IsDefined()
  @IsString()
  @IsEnum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte'])
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
}

export class NumberArrayFilter<T> {
  @IsDefined()
  @IsString()
  key: keyof T

  @IsDefined()
  @IsArray()
  @IsNumber({}, { each: true })
  values: number[]

  @IsDefined()
  @IsString()
  @IsEnum(['in', 'nin'])
  operator: 'in' | 'nin'
}
