import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinTable,
  OneToMany,
} from 'typeorm'
import * as bcrypt from 'bcrypt'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { RefreshToken } from './refresh-token.entity'
import { CustomFilter } from '@/modules/custom-filters/objects/entities/custom-filter.entity'
import {
  IRole,
  listOfVerbosePrefecture,
  VerbosePrefecture,
  PrefectureDictionary,
  Prefecture,
} from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'

const defaultRole: IRole = {
  label: null,
  options: {},
}

@Entity({ name: 'users' })
export class User extends BaseEntity {
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

  @ApiProperty({
    description: 'Préfecture à laquelle est rattachée le user.',
  })
  @Column({
    type: 'enum',
    enum: listOfVerbosePrefecture,
    nullable: false,
    default: PrefectureDictionary[Prefecture.D75],
  })
  prefecture: VerbosePrefecture

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

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, { cascade: true })
  refreshTokens: RefreshToken[]
}
