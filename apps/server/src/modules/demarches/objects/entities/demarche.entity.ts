import { Column, DeleteDateColumn, Entity, JoinTable, OneToMany } from 'typeorm'
import { Dossier } from '../../../dossiers/objects/entities/dossier.entity'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { Demarche as TDemarche } from '@dnum-mi/ds-api-client/dist/@types/generated-types'
import {
  eOrganismeType, OrganismeTypeKey,
  IDemarche,
  eIdentificationDemarche,
  IdentificationDemarcheKey,
} from '@biblio-num/shared'
import { CustomFilter } from '../../../custom-filters/objects/entities/custom-filter.entity'
import { MappingColumn } from '@/modules/demarches/objects/dtos/mapping-column.dto'
import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsOptional } from 'class-validator'

@Entity({ name: 'demarches' })
export class Demarche extends BaseEntity implements IDemarche {
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
      'Est ce que la démarche a une identification particulière. FE ou DDC.' +
      ' Une identification particulière entraine des comportements spécifiques.',
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

  @Column({ type: 'timestamp', default: '2022-01-01 00:00:00' })
  lastSynchronisedAt: Date

  @ApiProperty({
    description: "Quel type d'organisme la démarche concerne",
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

  @OneToMany(() => CustomFilter, (customFilter) => customFilter.demarche)
  @JoinTable()
  customFilters?: CustomFilter[]

  @DeleteDateColumn()
  deletedDate: Date | null
}
