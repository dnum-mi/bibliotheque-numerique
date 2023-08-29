import { Filter } from './filters'
import { IsArray, IsDefined, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator'
import { SortDto } from './sort.dto'
import { Type } from 'class-transformer'

export class PaginationDto<T> {
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number | 1

  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(100)
  perPage?: number | 20

  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  columns: ((keyof T) & string)[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortDto)
  sorts?: SortDto<T>[]

  @IsOptional()
  @IsArray() // TODO: find an elegant way to validate all possible filter
  filters?: Filter<T>[]
}
