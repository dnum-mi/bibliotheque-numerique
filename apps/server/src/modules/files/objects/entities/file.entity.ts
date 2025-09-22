import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { FileExtensionKey, eFileExtension, eState } from '@biblio-num/shared'
import {
  eFileSourceLabel,
  type FileSourceLabelKey,
  type FileTagKey,
  StateKey,
} from '@biblio-num/shared'

import { BaseEntity } from '@/shared/base-entity/base.entity'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'
import { eFileStorageIn, FileStorageInKey } from '../const/file-storage-in.enum'
import { ApiProperty } from '@nestjs/swagger'

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
    enum: eFileExtension,
    default: eFileExtension.unknown,
  })
  mimeType: FileExtensionKey

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

  @Column({ nullable: true })
  dossierId?: number | null

  @ManyToOne(() => Dossier, (doss) => doss.files, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'dossierId' })
  dossier: Dossier | null

  @Column({ nullable: true })
  organismeId?: number | null

  @ManyToOne(() => Organisme, (org) => org.files, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'organismeId',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK_organisme',
  })
  organisme: Organisme | null

  @Column({
    type: 'enum',
    enum: eFileStorageIn,
    default: eFileStorageIn.S3,
  })
  @ApiProperty({
    type: String,
    enum: eFileStorageIn,
    default: eFileStorageIn.S3,
  })
  storageIn: FileStorageInKey
}
