import { IPaginated } from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'

export class PaginatedDto<T> implements IPaginated<T> {
  @ApiProperty({
    description: 'Nombre total de résultats',
  })
  total: number

  @ApiProperty({
    description: 'Tableau des résultats pour la page donnée',
  })
  data: Partial<T>[]
}
