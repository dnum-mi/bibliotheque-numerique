import { Injectable } from "@nestjs/common";
import { LoggerService } from "../../../shared/modules/logger/logger.service";
import { Repository } from "typeorm";
import { Dossier } from "../objects/entities/dossier.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseEntityService } from "../../../shared/base-entity/base-entity.service";

@Injectable()
export class DossierService extends BaseEntityService<Dossier> {
  constructor(
    @InjectRepository(Dossier) protected readonly repo: Repository<Dossier>,
    protected readonly logger: LoggerService,
  ) {
    super(repo, logger);
    this.logger.setContext(this.constructor.name);
  }

  //TODO: remove and use parent method
  async findOne(id: number): Promise<Dossier> {
    this.logger.verbose("findOne");
    return await this.findOneById(id);
  }

  //TODO: remove and use parent method
  async findOneWithDetail(id: number): Promise<Dossier> {
    return await this.findOneById(id, { demarche: true });
  }
}
