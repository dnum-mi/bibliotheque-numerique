/* eslint-disable no-use-before-define */
import { BaseEntity } from '../../../../shared/base-entity/base.entity'
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { DsChampType, DsChampTypeKeys } from '../enums/ds-champ-type.enum'
import { FieldType, FieldTypeKeys } from '../enums/field-type.enum'
import { FormatFunctionRef, FormatFunctionRefKeys } from '@biblio-num/shared/dist'
import { Champ } from '@dnum-mi/ds-api-client/src/@types/types'
import { Dossier } from './dossier.entity'
import { FieldSource, FieldSourceKeys } from '../enums/field-source.enum'

export const fieldUniqueFields = ['dossierId', 'dsFieldId', 'parentRowIndex']

@Entity('fields')
@Unique('UQ_FIELD', fieldUniqueFields)
export class Field extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
    id: number

  @Column({
    type: 'enum',
    enum: FieldSource,
    nullable: false,
    default: FieldSource.champs,
  })
    fieldSource: FieldSourceKeys

  @Column({
    type: 'enum',
    enum: DsChampType,
    nullable: true,
    default: DsChampType.UnknownChamp,
  })
    dsChampType: DsChampTypeKeys | null

  @Column({
    type: 'enum',
    enum: FieldType,
    default: FieldType.string,
  })
    type: FieldTypeKeys

  @Column({
    type: 'enum',
    nullable: true,
    enum: FormatFunctionRef,
    default: null,
  })
    formatFunctionRef: FormatFunctionRefKeys | null

  @Column({
    nullable: true,
  })
    dsFieldId: string | null

  @Column({
    nullable: false,
  })
    stringValue: string

  @ManyToOne(() => Field, (field) => field.children)
    parent?: Field | null

  @Column({ nullable: true })
    parentId: number | null

  @OneToMany(() => Field, (field) => field.parent, {
    cascade: true,
  })
  @JoinColumn()
    children?: Field[] | null

  @Column({
    nullable: true,
  })
    parentRowIndex: null | number

  @Column({
    nullable: false,
  })
    label: string

  @Column({ type: 'jsonb', default: null, nullable: true })
    rawJson: Partial<Champ> | null

  @ManyToOne(() => Dossier, (dossier) => dossier.fields)
    dossier?: Dossier

  @Column()
    dossierId: number
}
