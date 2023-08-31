import { DeepPartial, DeleteResult, FindOneOptions, Repository } from 'typeorm'
import { BaseEntity } from './base.entity'
import { LoggerService } from '../modules/logger/logger.service'
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations'
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere'
import { NotFoundException } from '@nestjs/common'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'

export abstract class BaseEntityService<T extends BaseEntity = BaseEntity> {
  /* eslint-disable  @typescript-eslint/no-explicit-any */

  constructor (protected readonly repo: Repository<T>, protected readonly logger: LoggerService) {}

  // TODO: repository should not be used outside the service. When refacto is complete, this should be deleted
  public get repository (): Repository<T> {
    this.logger.verbose('get repository')
    return this.repo
  }

  async createAndSave (obj: DeepPartial<T>): Promise<T> {
    this.logger.verbose('createAndSave')
    return this.repo.save(this.repo.create(obj))
  }

  async findWithFilter (filter: FindOptionsWhere<T>, relations?: FindOptionsRelations<T>): Promise<T[]> {
    this.logger.verbose('findWithFilter')
    const query: Record<string, any> = {}
    if (relations) {
      query.relations = relations
    }
    if (filter) {
      query.where = filter
    }
    return this.repo.find(query)
  }

  async findAll (relations?: FindOptionsRelations<T>): Promise<T[]> {
    this.logger.verbose('findAll')
    return this.findWithFilter({}, relations)
  }

  async findOneById (id: number, relations?: FindOptionsRelations<T>): Promise<T> {
    this.logger.verbose('findOneById')
    const query: Record<string, any> = { where: { id } }
    if (relations) {
      query.relations = relations
    }
    // TODO: why do I need to cast ?
    return this.repo.findOne(query as FindOneOptions<T>)
  }

  async findOneOrThrow (options: FindOneOptions<T>): Promise<T> {
    const result = await this.repo.findOne(options)
    if (!result) {
      this.logger.debug(`Query object: ${JSON.stringify(options.where)}`)
      throw new NotFoundException('Cannot find resource.')
    }
    return result
  }

  async updateOrThrow (id: number, data: QueryDeepPartialEntity<T>): Promise<boolean> {
    this.logger.verbose('updateOrThrow')
    const result = await this.repo.update(id, data)
    if (result.affected === 0) {
      throw new NotFoundException(`${this.repo.metadata.name} id: ${id} not found`)
    }
    return true
  }

  async remove (id: number): Promise<DeleteResult> {
    this.logger.verbose('remove')
    return this.repo.delete(id)
  }
}
