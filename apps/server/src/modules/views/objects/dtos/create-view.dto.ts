import { IsArray, IsBoolean, IsDefined, IsOptional, IsString, Validate, ValidateIf } from 'class-validator'
import { IView } from '@biblio-num/shared'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { PaginationDto } from '@/shared/pagination/pagination.dto'
import { ColumnContainsKeyContraint } from '@/shared/pagination/column-contains-key.contraint'

export class CreateViewDto
  extends PickType(PaginationDto, ['columns', 'filters', 'sorts'])
  implements Omit<IView, 'id' | 'demarcheId'> {
  id: number

  @ApiProperty({
    description: 'Id de la démarche pour l\'affichage',
  })
  demarcheId?: number | undefined

  @ApiProperty({
    description: 'Nom de l\'affichage',
  })
  @IsString()
  @IsDefined()
  name: string

  @ApiProperty({
    description: 'Est ce que l\'affichage groupe par dossier',
  })
  @IsBoolean()
  @IsOptional()
  groupByDossier: boolean

  @ApiProperty({
    description: 'List des colonnes pour lesquelles il faut faire un total.',
  })
  @IsOptional()
  @ValidateIf((o) => o.totals !== null)
  @IsArray()
  @ValidateIf((o) => Array.isArray(o.columns) && o.columns.length > 0 && Array.isArray(o.totals))
  @Validate(ColumnContainsKeyContraint, ['totals'])
  @IsString({ each: true })
  totals: string[] | null
}
