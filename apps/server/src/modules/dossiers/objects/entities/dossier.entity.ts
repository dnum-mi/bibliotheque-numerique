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
import { IDossier, Prefecture, PrefectureKey } from '@biblio-num/shared'
import { File } from '@/modules/files/objects/entities/file.entity'

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
    description:
      'Numéro du dossier provenant de sa source. (100% DS pour le moment)',
  })
  @Column({ nullable: false })
  sourceId: string

  @Column({ type: 'timestamp', nullable: true, default: null })
  @ApiProperty({
    description: 'date de dépôt du dossier sur démarche simplifié',
  })
  dateDepot: Date

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
  prefecture: PrefectureKey | null

  @OneToMany(() => File, (file) => file.dossier, { cascade: true })
  @JoinColumn()
  files?: File[]

  @DeleteDateColumn()
  deletedDate: Date | null

  @Column({
    type: 'timestamp',
    default: null,
    nullable: true,
  })
  @ApiProperty({
    description: 'Est ce que le dossier a été anonymisé.',
    type: Date,
    nullable: true,
  })
  anonymisedAt: Date | null

  @Column({ type: 'timestamp', nullable: true, default: null })
  @ApiProperty({
    description:
      'La dernière date de traitement du dossier sur Démarches simplifiées.',
  })
  dateTraitement: Date | null
}
