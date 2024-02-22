import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { FileMimeTypeKey, eFileMimeType, eState } from '@biblio-num/shared'
import {
  eFileSourceLabel,
  type FileSourceLabelKey,
  type FileTagKey,
  StateKey,
} from '@biblio-num/shared'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'

@Entity()
export class File extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  declare uuid: string

  @Column({ type: 'varchar' })
  label: string

  @Column({ type: 'varchar' })
  originalLabel: string

  @Column({ type: 'varchar' })
  checksum: string

  @Column({ type: 'int' })
  byteSize: number

  @Column({
    type: 'enum',
    enum: eFileMimeType,
    default: eFileMimeType.unknown,
  })
  mimeType: FileMimeTypeKey

  // TODO: a table state indeed ?
  @Column({
    type: 'enum',
    enum: eState,
    default: eState.queued,
  })
  state: StateKey

  @Column({
    type: 'enum',
    enum: eFileSourceLabel,
    default: eFileSourceLabel['ds-champs'],
  })
  sourceLabel: FileSourceLabelKey

  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
  })
  sourceStringId: string | null

  // we don't put enum in postgres to not run migration everytime we add a tag. It's only a string
  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
  })
  tag: FileTagKey

  @Column({ type: 'int', nullable: true })
  sourceIndex: number | null

  @Column({ type: 'timestamp', nullable: true })
  sourceUploadedAt: Date | null

  @ManyToOne(() => Dossier, (doss) => doss.files)
  dossier: Dossier | null

  @ManyToOne(() => Organisme, (org) => org.files)
  organisme: Organisme | null
}
