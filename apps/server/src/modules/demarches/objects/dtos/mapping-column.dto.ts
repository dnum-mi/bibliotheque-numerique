import {
  FieldSourceKeys,
  FieldTypeKeys,
  FormatFunctionRefKeys,
  IMappingColumnWithoutChildren,
  IMappingColumn,
} from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'

export class MappingColumnWithoutChildren
implements IMappingColumnWithoutChildren {
  @ApiProperty({
    description: 'Id SQL de la colonne',
  })
  id: string

  @ApiProperty({
    description: "Nom de la colonne choisi par l'utilisateur",
  })
  columnLabel?: string

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
      'Fonction optionnelle de modification de l\'apparence des données pour ce champs. (Exemple: "country" = ajout d\'un drapeau pour les pays)',
  })
  formatFunctionRef?: FormatFunctionRefKeys | undefined

  @ApiProperty({
    description:
      'Provenance du la colonne. (Exemple: champ, annotation, création de BN etc.)',
  })
  source: FieldSourceKeys
}

export class MappingColumn
  extends MappingColumnWithoutChildren
  implements IMappingColumn {
  @ApiProperty({
    description:
      'liste des colonnes enfants de la colonne. Utilisée en cas de champ dit Répétable sur démarche simplifié.',
  })
  children?: MappingColumnWithoutChildren[]
}
