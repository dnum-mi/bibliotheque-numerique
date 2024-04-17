import { IPaginated } from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'

export class PaginatedDto<T> implements IPaginated<T> {
  @ApiProperty({
    description: 'Nombre total de résultats',
  })
  total: number

  @ApiProperty({
    description: 'Tableau des résultats pour la page donnée',
    type: () => Object,
    example: [
      {
        'name-of-my-column': 'text that contains my-text-to-search',
        'name-of-my-other-column': 145,
      },
      {
        'name-of-my-column': 'Another text that contains my-text-to-search',
        'name-of-my-other-column': 123,
      },
    ],
  })
  data: Partial<T>[]
}
