import type { ILeanDossierOutput, PrefectureKey } from '@biblio-num/shared'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { DossierState } from '@dnum-mi/ds-api-client'

export class LeanDossierOutputDto
  extends PickType(Dossier, [
    'id',
    'demarcheId',
    'state',
    'dateDepot',
    'prefecture',
  ])
  implements ILeanDossierOutput {
  @ApiProperty({
    description: 'titre de la démarche rattachée au dossier',
  })
  demarcheTitle: string

  prefecture: PrefectureKey
  state: DossierState
  dateDepot: Date
}
