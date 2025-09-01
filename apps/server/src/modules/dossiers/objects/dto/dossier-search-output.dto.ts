import { IDossierSearchOutput } from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'

export class DossierSearchOutputDto implements IDossierSearchOutput {
  @ApiProperty({
    description: 'Nombre total de résultats',
  })
  total: number

  @ApiProperty({
    description: 'résultats',
  })
  data: Record<string, string | number | Date | string[] | number[] | Date[]>[]
}
