import { CreateDateColumn, UpdateDateColumn } from 'typeorm'

export abstract class BaseEntity {
  id: number

  @CreateDateColumn({ type: 'timestamp' })
    createAt: Date // TODO: this should be createdAt (with a 'd')

  @UpdateDateColumn({ type: 'timestamp' })
    updateAt: Date // TODO: this should be updatedAt (with a 'd')
}
