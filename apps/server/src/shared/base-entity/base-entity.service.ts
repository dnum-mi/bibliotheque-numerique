import { Repository } from "typeorm";
import { BaseEntity } from "./base.entity";

export abstract class BaseEntityService<T extends BaseEntity> {
  constructor(protected readonly repo: Repository<T>) {}

  // TODO: repository should not be used outside the service. When refacto is complete, this should be deleted
  public get repository(): Repository<T> {
    return this.repo;
  }
}
