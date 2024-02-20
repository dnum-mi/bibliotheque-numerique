import {
  ArrayNotEmpty,
  IsArray,
  IsDefined,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  Validate,
  ValidateNested,
} from 'class-validator'
import { SortDto } from './sort.dto'
import { Type } from 'class-transformer'
import { FilterDto } from './filters'
import { IsValidFilter } from './filters/is-valid-filter.decorator'
import { ColumnContainsKeyContraint } from './column-contains-key.contraint'
import { IPagination } from '@biblio-num/shared'

export class PaginationDto<T> implements IPagination<T> {
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
  columns: ((keyof T) | string)[]

  @IsOptional()
  @IsArray()
  @Validate(ColumnContainsKeyContraint, ['sorts'])
  @ValidateNested({ each: true })
  @Type(() => SortDto)
  sorts: SortDto<T>[]

  @IsOptional()
  @IsValidFilter({ message: 'Les filtres de pagination ne sont pas valides.' })
  @Validate(ColumnContainsKeyContraint, ['filters'])
  filters: Record<keyof T, FilterDto> | null
}
