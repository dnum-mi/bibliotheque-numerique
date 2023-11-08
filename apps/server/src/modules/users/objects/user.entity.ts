import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import * as bcrypt from 'bcrypt'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { CustomFilter } from '@/modules/custom-filters/objects/entities/custom-filter.entity'
import { IUser, IRole } from '@biblio-num/shared'

const defaultRole: IRole = {
  label: null,
  options: [],
}

@Entity({ name: 'users' })
export class User extends BaseEntity implements IUser {
  @PrimaryGeneratedColumn('increment')
  declare id: number

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
    default: '',
  })
  lastname: string

  @Column({
    type: 'varchar',
    nullable: false,
    default: '',
  })
  firstname: string

  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
  })
  job: string

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

  @Column({
    type: 'jsonb',
    nullable: false,
    default: defaultRole,
  })
  role: IRole

  skipHashPassword: boolean = false

  @AfterLoad()
  async removeSkipHashPasswordReference(): Promise<void> {
    delete this.skipHashPassword
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword (): Promise<void> {
    if (!this.skipHashPassword) {
      this.password = await bcrypt.hash(this.password, 10)
    }
  }

  @OneToMany(() => CustomFilter, (customFilter) => customFilter.user)
  @JoinTable()
  customFilters?: CustomFilter[]
}
