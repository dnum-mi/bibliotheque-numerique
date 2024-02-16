import { IsArray, IsBoolean, IsDefined, IsOptional, IsString, Validate, ValidateIf } from 'class-validator'
import { ICustomFilter } from '@biblio-num/shared-utils'
import { PickType } from '@nestjs/swagger'
import { PaginationDto } from '@/shared/pagination/pagination.dto'
import { ColumnContainsKeyContraint } from '@/shared/pagination/column-contains-key.contraint'

export class CreateCustomFilterDto extends PickType(PaginationDto, ['columns', 'filters', 'sorts']) implements Omit<ICustomFilter, 'id' | 'demarcheId'> {
  id: number
  demarcheId?: number | undefined
  @IsString()
  @IsDefined()
  name: string

  @IsBoolean()
  @IsOptional()
  groupByDossier: boolean

  @IsOptional()
  @ValidateIf((o) => o.totals !== null)
  @IsArray()
  @Validate(ColumnContainsKeyContraint, ['totals'])
  @IsString({ each: true })
  totals: string[] | null
}
