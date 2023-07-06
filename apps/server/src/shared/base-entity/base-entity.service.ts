import { DeleteResult, FindOneOptions, Repository } from "typeorm";
import { BaseEntity } from "./base.entity";
import { LoggerService } from "../modules/logger/logger.service";
import { FindOptionsRelations } from "typeorm/find-options/FindOptionsRelations";
import { FindOptionsWhere } from "typeorm/find-options/FindOptionsWhere";
import { NotFoundException } from "@nestjs/common";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity";

export abstract class BaseEntityService<T extends BaseEntity = BaseEntity> {
  constructor(
    protected readonly repo: Repository<T>,
    protected readonly logger: LoggerService,
  ) {}

  // TODO: repository should not be used outside the service. When refacto is complete, this should be deleted
  public get repository(): Repository<T> {
    this.logger.verbose("get repository");
    return this.repo;
  }

  async findWithFilter(
    filter: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>,
  ): Promise<T[]> {
    this.logger.verbose("findWithFilter");
    const query = {};
    if (relations) {
      query["relations"] = relations;
    }
    return this.repo.find(query);
  }

  async findAll(relations?: FindOptionsRelations<T>): Promise<T[]> {
    this.logger.verbose("findAll");
    return this.findWithFilter({}, relations);
  }

  async findOneById(
    id: number,
    relations?: FindOptionsRelations<T>,
  ): Promise<T> {
    this.logger.verbose("findOneById");
    const query = { where: { id } };
    if (relations) {
      query["relations"] = relations;
    }
    // TODO: why do I need to cast ?
    return this.repo.findOne(query as FindOneOptions<T>);
  }

  async updateOrThrow(
    id: number,
    data: QueryDeepPartialEntity<T>,
  ): Promise<void> {
    this.logger.verbose("updateOrThrow");
    const result = await this.repo.update(id, data);
    if (result.affected === 0) {
      throw new NotFoundException(
        `${this.repo.metadata.name} id: ${id} not found`,
      );
    }
  }

  async remove(id: number): Promise<DeleteResult> {
    this.logger.verbose("remove");
    return this.repo.delete(id);
  }
}
