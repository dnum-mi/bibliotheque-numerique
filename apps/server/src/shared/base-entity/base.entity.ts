import { CreateDateColumn, UpdateDateColumn } from 'typeorm'

export abstract class BaseEntity {
  id: number

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date
}
