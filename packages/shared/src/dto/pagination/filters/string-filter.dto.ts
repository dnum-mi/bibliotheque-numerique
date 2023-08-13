import { IsArray, IsDefined, IsEnum, IsString } from 'class-validator'

export class StringFilter<T> {
  @IsDefined()
  @IsString()
  key: keyof T

  @IsDefined()
  @IsString()
  value: string

  @IsDefined()
  @IsString()
  @IsEnum(['eq', 'neq', 'like', 'nlike'])
  operator: 'eq' | 'neq' | 'like' | 'nlike'
}

export class StringArrayFilter<T> {
  @IsDefined()
  @IsString()
  key: keyof T

  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  values: string[]

  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  @IsEnum(['in', 'nin', 'in-like', 'nin-like'], { each: true })
  operator: 'in' | 'nin' | 'in-like' | 'nin-like'
}
