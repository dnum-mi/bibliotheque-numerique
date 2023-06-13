import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

import { CreateDemarcheDSDto } from './create-demarche-ds.dto'
import { CreateDossierDto } from './create-dossier.dto'

export class CreateDemarcheDto {
  @ApiProperty({
    description: 'Démarche associée dans l’application Démarches Simplifiées',
  })
  @IsNotEmpty()
  demarcheDS: CreateDemarcheDSDto

  dossiers: CreateDossierDto[]

  state: string

  title: string

  identification: string

  typeOrganisme: string

  mappingColumns: any[] // eslint-disable-line @typescript-eslint/no-explicit-any
}
