import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import * as bcrypt from 'bcrypt'
import { Role } from '../../roles/entities/role.entity'
import { BaseEntity } from '../../../shared/base-entity/base.entity'

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
    id: number

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
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
}
