import { IsArray, IsBoolean, IsDefined, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator'
import { ICustomFilter } from '../../interfaces'
import { FilterDto, SortDto } from '../pagination'
import { IsValidFilter } from '../pagination/filters/is-valid-filter.decorator'
import { DynamicKeys } from '../dossier'
import { Type } from 'class-transformer'

export class CreateCustomFilterDto implements Omit<ICustomFilter, 'id'> {
  @IsString()
  @IsDefined()
  name: string

  @IsBoolean()
  @IsOptional()
  groupByDossier: boolean

  @IsDefined()
  @IsArray()
  @IsString({ each: true })
  columns: string[]

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SortDto)
  sorts?: SortDto<DynamicKeys>[]

  @IsValidFilter({ message: 'Les filtres de pagination ne sont pas valides.' })
  @IsOptional()
  filters?: Record<string, FilterDto>
}
