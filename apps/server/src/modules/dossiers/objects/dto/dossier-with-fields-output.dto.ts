import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'
import { IDossierFieldsOutput, IFieldList } from '@biblio-num/shared'
import {
  DossierState,
  Message,
  PersonneMorale,
  PersonnePhysique,
} from '@dnum-mi/ds-api-client'
import { ApiProperty, PickType } from '@nestjs/swagger'
import { File } from '@/modules/files/objects/entities/file.entity'

export class OrganismeOutput extends PickType(Organisme, [
  'id',
  'type',
  'title',
  'idRna',
  'idRnf',
] as const) {}

export class DemarcheOutput extends PickType(Demarche, [
  'id',
  'title',
  'identification',
] as const) {}

export class DossierWithFieldsOutputDto implements IDossierFieldsOutput {
  @ApiProperty({
    description: 'Id du dossier',
  })
  id: number

  @ApiProperty({
    description: 'Organisme',
  })
  organisme: OrganismeOutput

  @ApiProperty({
    description: 'Démarche associée au dossier',
  })
  demarche: DemarcheOutput

  @ApiProperty({
    description: 'Id de la source du dossier',
  })
  sourceId?: string

  @ApiProperty({
    description: 'Préfecture à laquelle est rattachée le dossier',
  })
  prefecture?: string

  @ApiProperty({
    description: 'Date de dépôt du dossier',
  })
  dateDepot?: Date

  @ApiProperty({
    description: 'Date de passage en instruction du dossier',
  })
  datePassageEnInstruction?: Date

  @ApiProperty({
    description: 'État du dossier provenant de démarche simplifié',
    enum: DossierState,
  })
  state?: DossierState

  @ApiProperty({
    description: 'Date de publication du dossier',
  })
  datePublication?: Date

  @ApiProperty({
    description: 'Champs du dossier',
  })
  demandeur?: PersonneMorale | PersonnePhysique | null

  @ApiProperty({
    description: 'Champs du dossier',
  })
  demandeurEmail?: string

  @ApiProperty({
    description: 'Champs du dossier',
  })
  champs?: IFieldList[]

  @ApiProperty({
    description: 'Annotations du dossier',
  })
  annotations?: IFieldList[]

  @ApiProperty({
    description: 'Messages du dossier',
  })
  messages?: Message[]

  @ApiProperty({
    description: 'Fichiers du dossier',
  })
  files?: File[]
}
