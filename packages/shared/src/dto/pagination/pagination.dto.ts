import { Filter } from './filters'
import { IsArray, IsDefined, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { SortDto } from './sort.dto'

export class PaginationDto<T> {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number | 1

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(5)
  @Max(100)
  perPage?: number | 20

  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  columns: (keyof T)[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  sorts?: SortDto<T>[]

  @IsOptional()
  @IsArray() // TODO: find an elegant way to validate all possible filter
  filters?: Filter<T>[]
}
