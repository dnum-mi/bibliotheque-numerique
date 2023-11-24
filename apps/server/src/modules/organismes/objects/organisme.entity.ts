import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import {
  IOrganisme,
  OrganismeType,
  OrganismeTypeKeys,
  IRnaOutput,
  IRnfOutput,
} from '@biblio-num/shared'

@Entity({ name: 'organismes' })
export class Organisme extends BaseEntity implements IOrganisme {
  @PrimaryGeneratedColumn('increment')
  declare id: number

  @Column({
    type: 'enum',
    enum: OrganismeType,
    default: OrganismeType.unknown,
  })
  type: OrganismeTypeKeys

  @Column({
    type: 'varchar',
    nullable: false,
  })
  title: string

  @Column({
    type: 'varchar',
    nullable: true,
  })
  email: string

  @Column({
    type: 'varchar',
    nullable: true,
  })
  phoneNumber: string

  @Column({ type: 'date' })
  dateCreation: Date

  @Column({
    type: 'date',
    nullable: true,
  })
  dateDissolution: Date

  @OneToMany(() => Dossier, (dossier) => dossier.organisme)
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
}
