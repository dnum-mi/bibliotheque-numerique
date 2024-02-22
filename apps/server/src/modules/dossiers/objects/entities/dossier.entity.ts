import {
  Column,
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

@Entity({ name: 'dossiers' })
@Unique('UQ_DOSSIER', ['sourceId', 'demarche'])
export class Dossier extends BaseEntity implements IDossier {
  @Column({ nullable: false })
  demarcheId: number

  @ManyToOne(() => Demarche, (demarche) => demarche.dossiers)
  @JoinColumn()
  demarche?: Demarche

  @OneToMany(() => Field, (field) => field.dossier, { cascade: true })
  @JoinColumn()
  fields?: Field[]

  @ApiProperty({ enum: DossierState })
  @Column({ type: 'varchar' })
  state: DossierState

  @Column({ nullable: false })
  sourceId: string

  @Column({ nullable: true, default: null })
  dateDepot: string

  @Column({ type: 'jsonb', default: '{}' })
  dsDataJson: Partial<TDossier>

  @ManyToOne(() => Organisme, (org) => org.dossiers)
  organisme?: Organisme | null

  @Column({
    type: 'enum',
    enum: Object.keys(Prefecture),
    nullable: true,
    default: null,
  })
  prefecture: PrefectureKeys | null

  @OneToMany(() => File, (file) => file)
  @JoinColumn()
  files?: File[]
}
