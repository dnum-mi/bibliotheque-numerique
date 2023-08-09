import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'
import { Organisme } from './organisme.entity'
import { Connector } from '../../../modules/connector/connector.entity'
import { BaseEntity } from '../../../shared/base-entity/base.entity'

@Entity({ name: 'organismes_datas' })
export class OrganismesData extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
    id: number

  @ManyToOne(() => Connector)
  @JoinColumn()
    organismesSource: Connector

  @ManyToOne(() => Organisme)
  @JoinColumn()
    organisme: Organisme

  @Column({
    type: 'varchar',
    nullable: false,
  })
    idRef: string

  @Column({ type: 'jsonb' })
  // TODO: fixe type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dataJson: any

  @Column({ type: 'timestamp' })
    dataUpdateAt: Date
}

export type TUpsertOrganismeData = Partial<OrganismesData>;
