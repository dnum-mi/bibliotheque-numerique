import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import {
  DynamicKeys,
  FilterDto,
  ICustomFilter,
  SortDto,
} from '@biblio-num/shared'
import { User } from '@/modules/users/entities/user.entity'
import { Demarche } from '../../../demarches/objects/entities/demarche.entity'

@Entity()
@Unique('UQ_CUSTOM_FILTERS', ['userId', 'name'])
export class CustomFilter extends BaseEntity implements ICustomFilter {
  @PrimaryGeneratedColumn('increment')
  declare id: number

  @Column({ type: 'varchar', default: 'Tableau personnalisé', nullable: false })
  name: string

  @Column({ type: 'boolean', default: false })
  groupByDossier: boolean

  @Column({ type: 'jsonb', default: '[]', nullable: false })
  columns: string[]

  @Column({ type: 'jsonb', default: '[]', nullable: true })
  sorts?: SortDto<DynamicKeys>[] | null

  @Column({ type: 'jsonb', nullable: true, default: null })
  filters?: Record<keyof DynamicKeys, FilterDto> | null

  @ManyToOne(() => User, (user) => user.customFilters)
  user?: User

  @Column()
  userId: number

  @ManyToOne(() => Demarche, (demarche) => demarche.customFilters)
  demarche?: Demarche

  @Column({ type: 'int', nullable: false })
  demarcheId: number
}
