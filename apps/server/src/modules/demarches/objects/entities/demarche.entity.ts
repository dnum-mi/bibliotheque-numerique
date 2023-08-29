import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm'
import { Dossier } from '../../../dossiers/objects/entities/dossier.entity'
import { BaseEntity } from '../../../../shared/base-entity/base.entity'
import { OrganismeType, OrganismeTypeKeys } from '../enums/organisme-type.enum'
import { Demarche as TDemarche } from '@dnum-mi/ds-api-client/dist/@types/generated-types'
import { MappingColumn } from './mapping-column.object'

@Entity({ name: 'demarches' })
export class Demarche extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToMany(() => Dossier, (dossier) => dossier.demarche)
  dossiers: Dossier[]

  @Column({ nullable: true })
  state: string | null

  @Column()
  title: string

  @Column({ nullable: true })
  identification: string

  @Column({ type: 'jsonb', default: '[]' })
  mappingColumns: MappingColumn[]

  @Column({ type: 'date', default: '2022-01-01' })
  lastSynchronisedAt: Date

  @Column({
    type: 'enum',
    enum: OrganismeType,
    default: OrganismeType.unknown,
  })
  type: OrganismeTypeKeys

  @Column({ type: 'jsonb', default: '{}' })
  dsDataJson: Partial<TDemarche>
}
