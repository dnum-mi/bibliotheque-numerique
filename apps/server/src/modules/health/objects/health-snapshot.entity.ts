import { Column, Entity } from 'typeorm'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import {
  DependencyName,
  iDependencyCheckResult,
} from '@biblio-num/shared'

@Entity({ name: 'health_snapshots' })
export class HealthSnapshot extends BaseEntity {
  @Column({
    type: 'boolean',
    default: false,
    nullable: false,
  })
  isEverythingOk: boolean

  @Column({
    type: 'jsonb',
    nullable: false,
    default: {},
  })
  dependenciesHash: Record<DependencyName, iDependencyCheckResult>
}
