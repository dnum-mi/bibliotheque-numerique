import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { SortDto } from './sort.dto'
import { Type } from 'class-transformer'
import { FilterDto } from './filters'
import { IsValidFilter } from './filters/is-valid-filter.decorator'

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
  @ArrayNotEmpty()
  columns: ((keyof T) & string)[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortDto)
  sorts: SortDto<T>[]

  @IsOptional()
  @IsValidFilter({ message: 'Les filtres de pagination ne sont pas valides.' })
  filters: Record<keyof T, FilterDto> | null
}
