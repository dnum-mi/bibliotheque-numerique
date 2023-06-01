import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'
import { CreateDemarcheDto } from './create-demarche.dto'

import { DossierState } from '../../constants'

export class CreateDossierDto {
  @ApiProperty({
    description: 'TODO',
  })
  @IsNotEmpty()
  dossierDS: string

  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  demarche: CreateDemarcheDto

  state: DossierState
}
