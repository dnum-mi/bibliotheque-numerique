import { DeepPartial, DeleteResult, FindManyOptions, FindOneOptions, FindOptionsSelect, Repository } from 'typeorm'
import { BaseEntity } from './base.entity'
import { LoggerService } from '../modules/logger/logger.service'
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations'
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere'
import { NotFoundException } from '@nestjs/common'
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity'
import { FieldTypeKeys } from '@biblio-num/shared'
import { PaginationDto } from '@/shared/pagination/pagination.dto'
import { PaginatedDto } from '@/shared/pagination/paginated.dto'
import { buildFilterQuery } from '@/shared/pagination/utils/build-filter.utils'

export abstract class BaseEntityService<T extends BaseEntity = BaseEntity> {
  /* eslint-disable  @typescript-eslint/no-explicit-any */

  constructor(
    protected readonly repo: Repository<T>,
    protected readonly logger: LoggerService,
    private readonly fieldTypeHash?: Record<string, FieldTypeKeys>,
  ) {}

  // TODO: repository should not be used outside the service. When refacto is complete, this should be deleted
  public get repository(): Repository<T> {
    this.logger.verbose('get repository')
    return this.repo
  }

  async createAndSave(obj: DeepPartial<T>): Promise<T> {
    this.logger.verbose('createAndSave')
    return this.repo.save(this.repo.create(obj))
  }

  async findWithFilter(
    filter: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>,
    select?: FindOptionsSelect<T>,
  ): Promise<T[]> {
    this.logger.verbose('findWithFilter')
    const query: FindManyOptions<T> = {}
    if (relations) {
      query.relations = relations
    }
    if (filter) {
      query.where = filter
    }
    if (select) {
      query.select = select
    }
    return this.repo.find(query)
  }

  async findAll(relations?: FindOptionsRelations<T>): Promise<T[]> {
    this.logger.verbose('findAll')
    return this.findWithFilter({}, relations)
  }

  async findOneById(
    id: number,
    relations?: FindOptionsRelations<T>,
  ): Promise<T> {
    this.logger.verbose('findOneById')
    const query: Record<string, any> = { where: { id } }
    if (relations) {
      query.relations = relations
    }
    // TODO: why do I need to cast ?
    return this.repo.findOne(query as FindOneOptions<T>)
  }

  async findOneOrThrow(options: FindOneOptions<T>): Promise<T> {
    const result = await this.repo.findOne(options)
    if (!result) {
      this.logger.debug(`Query object: ${JSON.stringify(options.where)}`)
      throw new NotFoundException('Ressource introuvable')
    }
    return result
  }

  async paginate<Y>(
    dto: PaginationDto<Y>,
    specificWhere?: FindOptionsWhere<Y>,
    specificInlineWhere: string[] = [],
    skipLimit: boolean = false,
  ): Promise<PaginatedDto<Y>> {
    this.logger.verbose('paginate')
    if (!this.fieldTypeHash) {
      throw new Error(
        'You must define a fieldTypeHash to use the paginate method',
      )
    }
    const query = this.repo.createQueryBuilder('o')
    if (dto.filters) {
      query.where(await buildFilterQuery(dto.filters, this.fieldTypeHash))
    }
    if (specificWhere) {
      query.andWhere(specificWhere)
    }
    if (specificInlineWhere.length) {
      query.andWhere(specificInlineWhere.join(' AND '))
    }
    const count = await query.getCount()
    if (dto.sorts?.length) {
      dto.sorts.forEach((sort) => {
        query.addOrderBy(`o.${sort.key}`, sort.order)
      })
    } else {
      query.addOrderBy('o.id', 'ASC')
    }
    if (!skipLimit) {
      query.limit(dto.perPage || 20)
      query.offset(dto.perPage * (dto.page - 1) || 0)
    }
    if (dto.columns?.length) {
      query.select(dto.columns.map((c) => `o.${String(c)}`).concat(['o.id']))
    }
    return query.getMany().then((data) => {
      return {
        data,
        total: count,
      } as unknown as PaginatedDto<Y>
    })
  }

  async updateOrThrow(
    id: number,
    data: QueryDeepPartialEntity<T>,
  ): Promise<boolean>

  async updateOrThrow(
    query: FindOptionsWhere<T>,
    data: QueryDeepPartialEntity<T>,
  ): Promise<boolean>

  async updateOrThrow(
    idOrQuery: number | FindOptionsWhere<T>,
    data: QueryDeepPartialEntity<T>,
  ): Promise<boolean> {
    this.logger.verbose('updateOrThrow')
    let query
    if (typeof idOrQuery === 'number') {
      query = { id: idOrQuery }
    } else {
      query = idOrQuery
    }
    const result = await this.repo.update(query, data)
    if (result.affected === 0) {
      throw new NotFoundException(
        `${this.repo.metadata.name} not found for update.`,
      )
    }

    return true
  }

  async updateAndReturnById(
    id: number,
    data: QueryDeepPartialEntity<T>,
  ): Promise<T> {
    this.logger.verbose('updateAndReturn')
    const result = await this.repo
      .createQueryBuilder()
      .update(data)
      .where('id = :id', { id })
      .returning('*')
      .updateEntity(true)
      .execute()

    return result.raw[0]
  }

  async remove(id: number): Promise<DeleteResult>
  async remove(query: FindOptionsWhere<T>): Promise<DeleteResult>
  async remove(idOrQuery: number | FindOptionsWhere<T>): Promise<DeleteResult> {
    this.logger.verbose('remove')
    let query
    if (typeof idOrQuery === 'number') {
      query = { id: idOrQuery }
    } else {
      query = idOrQuery
    }
    return this.repo.delete(query)
  }
}
