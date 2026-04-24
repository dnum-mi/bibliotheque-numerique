import {
  AfterLoad,
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinTable,
  OneToMany,
  OneToOne,
} from 'typeorm'
import * as bcrypt from 'bcrypt'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { RefreshToken } from '../../auth/objects/refresh-token.entity'
import { View } from '@/modules/views/objects/entities/view.entity'
import {
  IRole,
  listOfVerbosePrefecture,
  VerbosePrefecture,
  PrefectureDictionary,
  Prefecture,
  ILastConsultedOrganisme,
} from '@biblio-num/shared'
import { ApiProperty } from '@nestjs/swagger'

const defaultRole: IRole = {
  label: null,
  options: {},
}

@Entity({ name: 'users' })
export class User extends BaseEntity {
  private static readonly saltRounds = 10

  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds)
  }

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
    type: 'integer',
    nullable: false,
    default: 0,
  })
  loginAttempts: number

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
      this.password = await User.hash(this.password)
    }
  }

  @OneToMany(() => View, (view) => view.user)
  @JoinTable()
  views?: View[]

  @OneToOne(() => RefreshToken, (refreshToken) => refreshToken.user, { cascade: true })
  refreshToken: RefreshToken[]

  @Column({
    type: 'jsonb',
    nullable: false,
    default: [],
  })
  recentOrganismes: ILastConsultedOrganisme[]

  @Index('IDX_USERS_TERMS_ACCEPTED_AT')
  @Column({
    type: 'timestamptz',
    nullable: true,
    default: null,
  })
  termsAcceptedAt: Date | null
}
