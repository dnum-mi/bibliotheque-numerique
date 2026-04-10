import { ApiProperty } from '@nestjs/swagger'
import { ImportResult } from '../constants/maarch.types'

export class ImportMaarchOutputDto implements ImportResult {
  @ApiProperty({
    description: 'Id de la démarche créée à partir de l’import Maarch',
  })
  demarcheId: number

  @ApiProperty({
    description: 'Nombre de dossiers créés à partir de l’import Maarch',
  })
  countDossiers: number
}
