import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm'
import { DossierState } from '@dnum-mi/ds-api-client/dist/@types/types'
import { Demarche } from '../../../demarches/objects/entities/demarche.entity'
import { ApiProperty } from '@nestjs/swagger'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { Field } from './field.entity'
import { Dossier as TDossier } from '@dnum-mi/ds-api-client/dist/@types/generated-types'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'
import { IDossier, Prefecture, PrefectureKeys } from '@biblio-num/shared'
import { File } from '@/modules/files/objects/entities/file.entity'
import { IsArray, IsEnum, IsOptional } from 'class-validator'

@Entity({ name: 'dossiers' })
@Unique('UQ_DOSSIER', ['sourceId', 'demarche'])
export class Dossier extends BaseEntity implements IDossier {
  @ApiProperty({
    description: 'Id de la démarche du dossier',
  })
  @Column({ nullable: false })
  demarcheId: number

  @ManyToOne(() => Demarche, (demarche) => demarche.dossiers)
  @JoinColumn()
  demarche?: Demarche

  @OneToMany(() => Field, (field) => field.dossier, { cascade: true })
  @JoinColumn()
  fields?: Field[]

  @ApiProperty({
    description: 'État du dossier provenant de démarche simplifié',
  })
  @ApiProperty({ enum: DossierState })
  @Column({ type: 'varchar' })
  state: DossierState

  @ApiProperty({
    description: 'Id du dossier provenant de sa source. (100% DS pour le moment)',
  })
  @Column({ nullable: false })
  sourceId: string

  @ApiProperty({
    description: 'date de dépôt du dossier sur démarche simplifié',
  })
  @Column({ nullable: true, default: null })
  dateDepot: string

  @ApiProperty({
    description: 'json original téléchargé de démarche simplifié',
  })
  @Column({ type: 'jsonb', default: '{}' })
  dsDataJson: Partial<TDossier>

  @ManyToOne(() => Organisme, (org) => org.dossiers, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'organismeId',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_organisme',
  })
  organisme?: Organisme | null

  @ApiProperty({
    description: 'Préfecture à laquelle est rattachée le dossier',
  })
  @Column({
    type: 'enum',
    enum: Object.keys(Prefecture),
    nullable: true,
    default: null,
  })
  prefecture: PrefectureKeys | null

  @OneToMany(() => File, (file) => file.dossier)
  @JoinColumn()
  files?: File[]

  @DeleteDateColumn()
  deletedDate: Date | null
}
