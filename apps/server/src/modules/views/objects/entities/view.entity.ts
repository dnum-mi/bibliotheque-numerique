import { Column, Entity, ManyToOne, Unique } from 'typeorm'
import { BaseEntity } from '@/shared/base-entity/base.entity'

import {
  DynamicKeys,
} from '@biblio-num/shared'
import { User } from '@/modules/users/objects/user.entity'
import { Demarche } from '../../../demarches/objects/entities/demarche.entity'
import { SortDto } from '@/shared/pagination/sort.dto'
import { FilterDto } from '@/shared/pagination/filters'

export type FiltersInView = Record<keyof DynamicKeys, FilterDto> | null

@Entity({ name: 'views' })
@Unique('UQ_VIEWS', ['userId', 'name'])
export class View extends BaseEntity {
 @Column({ type: 'varchar', default: 'Tableau personnalisé', nullable: false })
  name: string

  @Column({ type: 'boolean', default: false })
  groupByDossier: boolean

  @Column({ type: 'jsonb', default: '[]', nullable: false })
  columns: string[]

  @Column({ type: 'jsonb', default: '[]', nullable: true })
  sorts: SortDto<DynamicKeys>[] | null

  @Column({ type: 'jsonb', default: '{}', nullable: true })
  columnWidthById: Record<(string | number | symbol), number> | null

  @Column({ type: 'jsonb', nullable: true, default: null })
  filters: FiltersInView | null

  @ManyToOne(() => User, (user) => user.views)
  user?: User

  @Column()
  userId: number

  @ManyToOne(() => Demarche, (demarche) => demarche.views)
  demarche?: Demarche

  @Column({ type: 'int', nullable: false })
  demarcheId: number

  @Column({ type: 'jsonb', default: '[]', nullable: true })
  totals: string[] | null
}
