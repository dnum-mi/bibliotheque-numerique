import { dossierSourceArray, DossierSourceKey, IOrganismeDossier } from '@biblio-num/shared'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class OrganismeDossierDto implements IOrganismeDossier {
  @ApiPropertyOptional({
    description: 'Identifiant unique du dossier',
    example: 25120020,
    type: Number,
    nullable: true,
  })
  id: number | null

  @ApiPropertyOptional({
    description: 'Source de provenance de la donnée (DS ou RNA)',
    enum: dossierSourceArray,
    example: 'DS',
    nullable: true,
  })
  source: DossierSourceKey | null

  @ApiProperty({
    description: 'Nom de la démarche associée au dossier',
    example: "Dépôt annuel des comptes et du rapport d'activité des fonds de dotation (national)",
    type: String,
  })
  demarche: string

  @ApiPropertyOptional({
    description: 'Statut de traitement du dossier (ex: accepte, en_instruction)',
    example: 'accepte',
    type: String,
    nullable: true,
  })
  statut: string | null

  @ApiPropertyOptional({
    description: 'Repère',
    nullable: true,
    type: String,
  })
  repere: string | null

  @ApiPropertyOptional({
    description: 'Date de dépôt du dossier',
    example: '2026-01-06T08:16:43.000Z',
    type: Date,
    nullable: true,
  })
  dateDepot: Date | null

  @ApiPropertyOptional({
    description: 'Date de décision du dossier)',
    example: '2026-01-10T14:00:00.000Z',
    type: Date,
    nullable: true,
  })
  dateDecision: Date | null

  @ApiPropertyOptional({
    description: 'Date de publication',
    example: '2026-01-15T09:00:00.000Z',
    type: Date,
    nullable: true,
  })
  datePublication: Date | null
}
