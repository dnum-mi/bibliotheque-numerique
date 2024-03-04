import { Column, DeleteDateColumn, Entity, JoinTable, OneToMany } from 'typeorm'
import { Dossier } from '../../../dossiers/objects/entities/dossier.entity'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { Demarche as TDemarche } from '@dnum-mi/ds-api-client/dist/@types/generated-types'
import type { OrganismeTypeKey } from '@biblio-num/shared'
import {
  IDemarche,
  IdentificationDemarche,
  IdentificationDemarcheKeys,
} from '@biblio-num/shared'
import { CustomFilter } from '../../../custom-filters/objects/entities/custom-filter.entity'
import { MappingColumn } from '@/modules/demarches/objects/dtos/mapping-column.dto'

@Entity({ name: 'demarches' })
export class Demarche extends BaseEntity implements IDemarche {
  @OneToMany(() => Dossier, (dossier) => dossier.demarche)
  dossiers: Dossier[]

  @Column({ nullable: true })
  state: string | null

  @Column()
  title: string

  @Column({
    type: 'enum',
    enum: IdentificationDemarche,
    nullable: true,
  })
  identification: IdentificationDemarcheKeys

  @Column({ type: 'jsonb', default: '[]' })
  mappingColumns: MappingColumn[]

  @Column({ type: 'timestamp', default: '2022-01-01' })
  lastSynchronisedAt: Date

  @Column({
    type: 'jsonb',
    default: '[]',
  })
  types: OrganismeTypeKey[]

  @Column({ type: 'jsonb', default: '{}' })
  dsDataJson: Partial<TDemarche>

  @OneToMany(() => CustomFilter, (customFilter) => customFilter.demarche)
  @JoinTable()
  customFilters?: CustomFilter[]

  @DeleteDateColumn()
  deletedDate: Date | null
}
