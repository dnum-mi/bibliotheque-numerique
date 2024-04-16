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
import { FilterDateDto, FilterDto, FilterEnumDto, FilterNumberDto, FilterTextDto } from './filters'
import { IsValidFilter } from './filters/is-valid-filter.decorator'
import { ColumnContainsKeyContraint } from './column-contains-key.contraint'
import { IPagination } from '@biblio-num/shared'
import { ApiExtraModels, ApiProperty } from '@nestjs/swagger'
import { FilterNumbersDto } from '@/shared/pagination/filters/numbers.filter.dto'

@ApiExtraModels(FilterTextDto, FilterNumberDto, FilterNumbersDto, FilterDateDto, FilterEnumDto)
export class PaginationDto<T> implements IPagination<T> {
  @ApiProperty({
    description: 'Numéro de page à récupérer',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number | 1

  @ApiProperty({
    description: "Nombre d'éléments par page à récupérer",
  })
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(100)
  perPage?: number | 20

  @ApiProperty({
    description: 'Liste des colonnes à récupérer',
  })
  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  @ArrayNotEmpty()
  columns: (keyof T | string)[]

  @ApiProperty({
    description: 'Paramètre de tri.',
    type: SortDto,
  })
  @IsOptional()
  @IsArray()
  @Validate(ColumnContainsKeyContraint, ['sorts'])
  @ValidateNested({ each: true })
  @Type(() => SortDto)
  sorts: SortDto<T>[]

  @ApiProperty({
    description:
      'Paramètre de filtre. Record avec la clef de la colonne concernée et le filtre correspondant. La colonne doit être selectionnée. Voir les models de filtreDto',
    type: () => Object,
  })
  @IsOptional()
  @IsValidFilter({ message: 'Les filtres de pagination ne sont pas valides.' })
  @Validate(ColumnContainsKeyContraint, ['filters'])
  filters: Record<keyof T, FilterDto> | null
}
