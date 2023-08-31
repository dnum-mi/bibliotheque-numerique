import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { BaseEntity } from '../../shared/base-entity/base.entity'

export const AuthTypes = {
  BEARER_TOKEN: 'Bearer',
} as const

export type AuthType = typeof AuthTypes[keyof typeof AuthTypes]

export type TMethod = 'GET' | 'POST';

@Entity({ name: 'connectors' })
@Unique('UK_CONNECTOR_NAME', ['name'])
export class Connector extends BaseEntity {
  @PrimaryGeneratedColumn('increment', {
    primaryKeyConstraintName: 'PK_CONNECTOR_ID',
  })
    id: number

  @Column({
    type: 'varchar',
    nullable: false,
  })
    name: string

  @Column({ type: 'varchar', default: 'GET' })
    method: TMethod

  @Column({
    type: 'varchar',
    nullable: false,
  })
    url: string // https://api.entreprise.data.gouv.fr/v2/etablissements/$params1}?query1={$query1}&query2={$query2}

  @Column({ type: 'jsonb', nullable: true })
    params: string[] // Params are needed for the url, we store the keys only

  @Column({ type: 'jsonb', nullable: true })
    query: Record<string, string> // Params are needed for the url, we store the keys and defaultValues

  @Column({ nullable: true })
    typeAuth:AuthType

  @Column({ nullable: true })
    token: string
}
