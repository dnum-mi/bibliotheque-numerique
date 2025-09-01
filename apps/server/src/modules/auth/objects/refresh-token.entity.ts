import {
  Entity,
  Column,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm'
import { User } from '../../users/objects/user.entity'

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
  @Column({ type: 'varchar', nullable: false, unique: true, primary: true })
  refreshToken: string

  @Column({ type: 'boolean', default: false })
  connectWithSso: boolean

  @OneToOne(() => User, (user) => user.refreshToken, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User

  @CreateDateColumn()
  createdAt: Date
}
