import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity, JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import * as bcrypt from 'bcrypt'
import { Role } from '../../roles/entities/role.entity'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { CustomFilter } from '@/modules/custom-filters/objects/entities/custom-filter.entity'

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
    id: number

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
    transformer: {
      from: (dbValue: string) => dbValue,
      to: (entityValue: string) => entityValue.toLowerCase(),
    },
  })
    email: string

  @Column({
    type: 'varchar',
    nullable: false,
    select: false,
  })
    password: string

  @Column({
    type: 'boolean',
    nullable: false,
    default: false,
  })
   validated: boolean

  @ManyToMany(() => Role, (role) => role.users)
    roles: Role[]

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword (): Promise<void> {
    this.password = await bcrypt.hash(this.password, 10)
  }

  @OneToMany(() => CustomFilter, (customFilter) => customFilter.user)
  @JoinTable()
  customFilters?: CustomFilter[]
}
