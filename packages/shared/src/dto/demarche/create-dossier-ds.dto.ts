import { ApiProperty } from '@nestjs/swagger'

import { Dossier as DossierDS } from '@dnum-mi/ds-api-client/dist/@types/types'

export class CreateDossierDSDto {
  @ApiProperty({
    description: 'Create',
  })
    dataJson: Partial<DossierDS>

  @ApiProperty({
    description: '',
  })
    dsUpdateAt: Date
}
