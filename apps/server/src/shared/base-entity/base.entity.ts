import { CreateDateColumn, UpdateDateColumn } from 'typeorm'

export abstract class BaseEntity {
  id: number

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date // TODO: this should be createdAt (with a 'd')

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date // TODO: this should be updatedAt (with a 'd')
}
