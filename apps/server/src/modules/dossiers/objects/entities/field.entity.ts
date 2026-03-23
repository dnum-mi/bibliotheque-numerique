import { BaseEntity } from '@/shared/base-entity/base.entity'
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm'
import {
  DsChampType,
  DsChampTypeKeys,
} from '@/shared/modules/ds-api/objects/ds-champ-type.enum'
import {
  FieldSource,
  FieldSourceKeys,
  FieldType,
  FieldTypeKeys,
  FormatFunctionRef,
  FormatFunctionRefKeys,
} from '@biblio-num/shared'
import { Dossier } from './dossier.entity'
import { CustomChamp } from '@dnum-mi/ds-api-client'
import { FieldCodeKey } from '@/modules/dossiers/objects/constante/field-code.enum'

export const fieldUniqueFields = ['dossierId', 'sourceId', 'parentRowIndex']

@Entity('fields')
@Unique('UQ_FIELD', fieldUniqueFields)
export class Field extends BaseEntity {
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

  @Index()
  @Column({
    nullable: false,
  })
  sourceId: string

  @Index('IDX_fields_stringValue_prefix', {
    // Tyeporm ne peut pas gérer (left("stringValue", 2000)) et éviter détruit l'index par une migration
    synchronize: false,
  })
  @Column({
    nullable: false,
  })
  stringValue: string

  @Index()
  @Column({
    nullable: true,
  })
  dateValue: Date | null

  @Index()
  @Column({
    type: 'numeric',
    precision: 22,
    scale: 2,
    nullable: true,
  })
  numberValue: string | null

  @ManyToOne(() => Field, (field) => field.children)
  parent?: Field | null

  @Index('IDX_FIELDS_PARENTID')
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
  rawJson: Partial<CustomChamp> | null

  @ManyToOne(() => Dossier, (dossier) => dossier.fields, {
    onDelete: 'CASCADE',
  })
  dossier?: Dossier

  @Index('IDX_FIELDS_DOSSIERID')
  @Column()
  dossierId: number

  // we don't put enum in postgres to not run migration everytime we add a code. It's only a string
  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
  })
  code: FieldCodeKey | null

  @Column({
    type: 'timestamp',
    default: null,
    nullable: true,
  })
  anonymisedAt?: Date | null
}
