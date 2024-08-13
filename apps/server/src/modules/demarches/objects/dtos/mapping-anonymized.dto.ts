import {
  FieldSourceKeys,
  FieldTypeKeys,
  IMappingAnonymizedChampWithoutChildren,
  IMappingAnonymizedChamp,
} from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class MappingAnonymizedWithoutChildren
implements IMappingAnonymizedChampWithoutChildren {
  @ApiProperty({
    description: 'Id SQL de la colonne',
  })
  @IsNotEmpty()
  id: string

  @ApiProperty({
    description: 'Nom original du champ, ou annotation de démarche simplifiée',
  })
  originalLabel: string

  @ApiProperty({
    description:
      "Description original du champs de l'annotation de démarche simplifiée",
  })
  originalDescription?: string

  @ApiProperty({
    description:
      'Est ce que le champ n\'est qu\'un "header" sur démarche simplifié',
  })
  isHeader?: boolean

  @ApiProperty({
    description: 'Type du  champs. Nombre, text etc.',
  })
  type?: FieldTypeKeys

  @ApiProperty({
    description:
      'Provenance du la colonne. (Exemple: champ, annotation, création de BN etc.)',
  })
  source: FieldSourceKeys
}

export class MappingAnonymized
  extends MappingAnonymizedWithoutChildren
  implements IMappingAnonymizedChamp {
  @ApiProperty({
    description:
      'liste des colonnes enfants de la colonne. Utilisée en cas de champ dit Répétable sur démarche simplifié.',
  })
  children?: MappingAnonymizedWithoutChildren[]
}
