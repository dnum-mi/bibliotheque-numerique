import { SortDto } from '@/shared/pagination/sort.dto'
import { DynamicKeys, IFilter, IView } from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'

export class ViewOutputDto implements IView {
  @ApiProperty({
    description: 'Id de l\'affichage',
  })
  id: number

  @ApiProperty({
    description: 'Nom de l\'affichage',
  })
  name: string

  @ApiProperty({
    description: 'Est ce que l\'affichage groupe par dossier',
  })
  groupByDossier: boolean

  @ApiProperty({
    description: 'Colonnes selectionnées pour l\'affichage',
  })
  columns: string[]

  @ApiProperty({
    description: 'Paramètre des tailles de colonne.',
  })
  columnWidthById?: Record<(string | number | symbol), number>

  @ApiProperty({
    description: 'Paramètre de tri pour l\'affichage.',
  })
  sorts: SortDto<DynamicKeys>[] | null

  @ApiProperty({
    description: 'Paramètre de filtrage pour l\'affichage',
  })
  filters: Record<keyof DynamicKeys, IFilter> | null

  @ApiProperty({
    description: 'Id de la démarche concernée pour l\'affichage',
  })
  demarcheId: number

  @ApiProperty({
    description: 'Pour quelle colonne l\'affichage doit générer un total',
  })
  totals: string[] | null
}
