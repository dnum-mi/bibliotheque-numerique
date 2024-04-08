import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
} from 'typeorm'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import {
  IOrganisme,
  IRnaOutput,
  IRnfOutput,
  eOrganismeType,
  OrganismeTypeKey,
  eState,
  StateKey,
  IPerson,
} from '@biblio-num/shared'
import { File } from '@/modules/files/objects/entities/file.entity'

@Entity({ name: 'organismes' })
export class Organisme extends BaseEntity implements IOrganisme {
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
  state: StateKey

  @Column({
    type: 'varchar',
    nullable: true,
  })
  title: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  email: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  phoneNumber: string | null

  @Column({ type: 'date', nullable: true })
  dateCreation: Date | null

  @Column({
    type: 'date',
    nullable: true,
  })
  dateDissolution: Date

  @Column({
    type: 'date',
    nullable: true,
  })
  fiscalEndDateAt: Date

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
  idRna: string | null

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  rnaJson: IRnaOutput
  //#endregion

  //#region RNF
  @Column({
    type: 'varchar',
    nullable: true,
    unique: true,
  })
  idRnf: string | null

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  rnfJson: IRnfOutput
  //#endregion

  //#region Address
  @Column({
    type: 'varchar',
    nullable: true,
  })
  addressLabel: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  addressPostalCode: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  addressCityName: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  addressType: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  addressStreetAddress: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  addressStreetNumber: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  addressStreetName: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  addressDepartmentName: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  addressDepartmentCode: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  addressRegionName: string | null

  @Column({
    type: 'varchar',
    nullable: true,
  })
  addressRegionCode: string | null
  //#endregion

  @OneToMany(() => File, (file) => file)
  @JoinColumn()
  files?: File[]

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  persons: IPerson[]
}
