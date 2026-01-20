import { Column, DeleteDateColumn, Entity, Index, JoinTable, OneToMany } from 'typeorm'
import { Dossier } from '../../../dossiers/objects/entities/dossier.entity'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { Demarche as TDemarche } from '@dnum-mi/ds-api-client/dist/@types/generated-types'
import {
  eOrganismeType, OrganismeTypeKey,
  IDemarche,
  eIdentificationDemarche,
  IdentificationDemarcheKey,
  IDemarcheOption,
  anonymisationEventKey,
  eAnonymisationEvent,
} from '@biblio-num/shared'
import { View } from '@/modules/views/objects/entities/view.entity'
import { MappingColumn } from '@/modules/demarches/objects/dtos/mapping-column.dto'
import { MappingAnonymized } from '@/modules/demarches/objects/dtos/mapping-anonymized.dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsOptional } from 'class-validator'

interface IDemarcheWithOptions extends IDemarche, IDemarcheOption {

}
@Entity({ name: 'demarches' })
export class Demarche extends BaseEntity implements IDemarcheWithOptions {
  @OneToMany(() => Dossier, (dossier) => dossier.demarche)
  dossiers: Dossier[]

  @Column({ nullable: true })
  state: string | null

  @ApiProperty({
    description: 'Titre de la démarche',
  })
  @Column()
  title: string

  @ApiProperty({
    description:
      'Est ce que la démarche a une identification particulière. FE, DDC ou MAARCH.' +
      ' Une identification particulière entraine des comportements spécifiques.',
    enum: eIdentificationDemarche,
  })
  @IsOptional()
  @IsEnum(eIdentificationDemarche)
  @Column({
    type: 'enum',
    enum: eIdentificationDemarche,
    nullable: true,
  })
  identification: IdentificationDemarcheKey

  @Column({ type: 'jsonb', default: '[]' })
  mappingColumns: MappingColumn[]

  @Column({ type: 'jsonb', default: '[]' })
  mappingAnonymized: MappingAnonymized[]

  @Column({ type: 'timestamp', default: '2022-01-01 00:00:00' })
  lastSynchronisedAt: Date

  @ApiProperty({
    description: "Quel type d'organisme la démarche concerne",
    enum: eOrganismeType,
  })
  @IsOptional()
  @IsEnum(eOrganismeType, { each: true })
  @IsArray()
  @Column({
    type: 'jsonb',
    default: '[]',
  })
  types: OrganismeTypeKey[]

  @Column({ type: 'jsonb', default: '{}' })
  dsDataJson: Partial<TDemarche>

  @OneToMany(() => View, (view) => view.demarche)
  @JoinTable()
  views?: View[]

  @DeleteDateColumn()
  deletedDate: Date | null

  @ApiProperty({
    description: 'Nombre de mois avant l\'anonymisation des données sensibles.',
    nullable: true,
  })
  @Column({
    type: 'integer',
    default: null,
    nullable: true,
  })
  nbrMonthAnonymisation: number

  @ApiProperty({
    description: 'Declecheur de l\'anonymisation des données sensibles.',
    nullable: false,
  })
  @Column({
    type: 'enum',
    enum: eAnonymisationEvent,
    nullable: true,
  })
  anonymizationEvent: anonymisationEventKey

  @ApiProperty({
    description: 'Numéro de la démarche (extrait de dsDataJson)',
    nullable: true,
  })
  @Index('IDX_DS_ID')
  @Column({
    type: 'integer',
    nullable: true,
  })
  dsId: number | null

  @ApiProperty({
    description: 'Date de création (extrait de dsDataJson)',
    nullable: true,
  })
  @Index('IDX_CREATE_AT')
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  dsCreatedAt: Date | null

  @ApiProperty({
    description: 'Date de publication (extrait de dsDataJson)',
    nullable: true,
  })
  @Index('IDX_DS_PUBLISHED_AT')
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  dsPublishedAt: Date | null
}
