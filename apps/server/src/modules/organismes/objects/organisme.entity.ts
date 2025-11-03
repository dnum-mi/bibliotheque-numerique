import { Column, Entity, JoinColumn, OneToMany } from 'typeorm'
import { ApiProperty } from '@nestjs/swagger'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import {
  IOrganisme,
  IRnaOutput,
  eOrganismeType,
  OrganismeTypeKey,
  eState,
  StateKey,
  IPerson,
  IFoundationOutput,
  IAssociationOutput,
} from '@biblio-num/shared'
import { File } from '@/modules/files/objects/entities/file.entity'
import { BaseEntitySyncState } from '@/shared/sync-state/objects/entities/base-entity-sync-state.entity'

@Entity({ name: 'organismes' })
export class Organisme extends BaseEntitySyncState implements IOrganisme {
  @ApiProperty({
    type: String,
    enum: eOrganismeType,
    default: eOrganismeType.unknown,
  })
  @Column({
    type: 'enum',
    enum: eOrganismeType,
    default: eOrganismeType.unknown,
  })
  type: OrganismeTypeKey

  // TODO: a table state indeed ? uploaded = synchronised. uploading = synchronising
  @Column({
    type: 'enum',
    enum: eState,
    default: eState.queued,
  })
  @ApiProperty({
    type: String,
    enum: eState,
    default: eState.queued,
  })
  state: StateKey

  @ApiProperty({
    type: String,
    nullable: true,
  })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  title: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @ApiProperty({
    type: String,
    nullable: true,
  })
  email: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @ApiProperty({
    type: String,
    nullable: true,
  })
  phoneNumber: string | null

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty({
    type: Date,
    nullable: true,
  })
  dateCreation: Date | null

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  @ApiProperty({
    type: Date,
    nullable: true,
  })
  dateDissolution: Date | null

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  @ApiProperty({
    type: Date,
    nullable: true,
  })
  fiscalEndDateAt: Date | null

  @OneToMany(() => Dossier, (dossier) => dossier.organisme, {
    onDelete: 'SET NULL',
  })
  @JoinColumn()
  dossiers?: Dossier[]

  //#region RNA
  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  @ApiProperty({
    type: String,
    nullable: true,
  })
  idRna: string | null

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  @ApiProperty({
    type: Object,
    description: 'Json original reçu de RNA',
    nullable: true,
  })
  rnaJson: IRnaOutput | IAssociationOutput
  //#endregion

  //#region RNF
  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  @ApiProperty({
    type: String,
    nullable: true,
  })
  idRnf: string | null

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  @ApiProperty({
    type: Object,
    description: 'Json original reçu de RNF',
    nullable: true,
  })
  rnfJson: IFoundationOutput | null
  //#endregion

  //#region Address
  @Column({
    type: 'varchar',
    nullable: true,
  })
  @ApiProperty({
    type: String,
    nullable: true,
  })
  addressLabel: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @ApiProperty({
    type: String,
    nullable: true,
  })
  addressPostalCode: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @ApiProperty({
    type: String,
    nullable: true,
  })
  addressCityName: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @ApiProperty({
    type: String,
    nullable: true,
  })
  addressType: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @ApiProperty({
    type: String,
    nullable: true,
  })
  addressStreetAddress: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @ApiProperty({
    type: String,
    nullable: true,
  })
  addressStreetNumber: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @ApiProperty({
    type: String,
    nullable: true,
  })
  addressStreetName: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @ApiProperty({
    type: String,
    nullable: true,
  })
  addressDepartmentName: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @ApiProperty({
    type: String,
    nullable: true,
  })
  addressDepartmentCode: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @ApiProperty({
    type: String,
    nullable: true,
  })
  addressRegionName: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  @ApiProperty({
    type: String,
    nullable: true,
  })
  addressRegionCode: string | null
  //#endregion

  @OneToMany(() => File, (file) => file)
  @JoinColumn()
  files?: File[]

  @ApiProperty({
    type: Number,
    isArray: true,
  })
  @Column({ type: 'jsonb', default: '[]', nullable: false })
  declarationYears: number[]

  @ApiProperty({
    type: Number,
    isArray: true,
  })
  @Column({ type: 'jsonb', default: '[]', nullable: false })
  missingDeclarationYears: number[]

  @ApiProperty({
    type: Object,
    description: 'Json original des personnes reçu de RNF',
  })
  @Column({
    type: 'jsonb',
    default: '[]',
    nullable: false,
  })
  persons: IPerson[]
}
