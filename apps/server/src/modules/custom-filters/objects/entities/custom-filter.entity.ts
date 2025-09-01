import { Column, Entity, ManyToOne, Unique } from 'typeorm'
import { BaseEntity } from '@/shared/base-entity/base.entity'

import {
  DynamicKeys,
} from '@biblio-num/shared'
import { User } from '@/modules/users/objects/user.entity'
import { Demarche } from '../../../demarches/objects/entities/demarche.entity'
import { SortDto } from '@/shared/pagination/sort.dto'
import { FilterDto } from '@/shared/pagination/filters'

export type FiltersInCustomFilter = Record<keyof DynamicKeys, FilterDto> | null

@Entity()
@Unique('UQ_CUSTOM_FILTERS', ['userId', 'name'])
export class CustomFilter extends BaseEntity {
 @Column({ type: 'varchar', default: 'Tableau personnalisé', nullable: false })
  name: string

  @Column({ type: 'boolean', default: false })
  groupByDossier: boolean

  @Column({ type: 'jsonb', default: '[]', nullable: false })
  columns: string[]

  @Column({ type: 'jsonb', default: '[]', nullable: true })
  sorts: SortDto<DynamicKeys>[] | null

  @Column({ type: 'jsonb', nullable: true, default: null })
  filters: FiltersInCustomFilter | null

  @ManyToOne(() => User, (user) => user.customFilters)
  user?: User

  @Column()
  userId: number

  @ManyToOne(() => Demarche, (demarche) => demarche.customFilters)
  demarche?: Demarche

  @Column({ type: 'int', nullable: false })
  demarcheId: number

  @Column({ type: 'jsonb', default: '[]', nullable: true })
  totals: string[] | null
}
