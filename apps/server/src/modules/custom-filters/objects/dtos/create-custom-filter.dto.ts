import { IsArray, IsBoolean, IsDefined, IsOptional, IsString, Validate, ValidateIf } from 'class-validator'
import { ICustomFilter } from '@biblio-num/shared'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { PaginationDto } from '@/shared/pagination/pagination.dto'
import { ColumnContainsKeyContraint } from '@/shared/pagination/column-contains-key.contraint'

export class CreateCustomFilterDto
  extends PickType(PaginationDto, ['columns', 'filters', 'sorts'])
  implements Omit<ICustomFilter, 'id' | 'demarcheId'> {
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
  @Validate(ColumnContainsKeyContraint, ['totals'])
  @IsString({ each: true })
  totals: string[] | null
}
