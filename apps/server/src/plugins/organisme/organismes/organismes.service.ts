import { Injectable, NotFoundException } from '@nestjs/common'
import { DataSource, Repository } from 'typeorm'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { OrganismesDatasService } from './organismes_datas.service'
import { ParseToOrganismesService } from '../parserByConnector/parse_to_organismes.service'
import { Organisme } from './organisme.entity'
import { BaseEntityService } from '../../../shared/base-entity/base-entity.service'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class OrganismesService extends BaseEntityService<Organisme> {
  constructor (
    private dataSource: DataSource,
    private parserToOrganismes: ParseToOrganismesService,
    private organismesDatasService: OrganismesDatasService,
    protected readonly logger: LoggerService,
    @InjectRepository(Organisme) protected readonly repo: Repository<Organisme>,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  findOneById (id: number): Promise<Organisme> {
    this.logger.verbose('findOneById')
    return super.findOneById(id, { organismeDatas: true })
  }

  findOneByIdRef (idRef: string): Promise<Organisme> {
    this.logger.verbose('findOneByIdRef')
    return this.repo.findOne({
      where: { idRef },
    })
  }

  async upsertOrganisme (idRef: string, sources: string[]): Promise<Organisme> {
    this.logger.verbose('upsertOrganisme')
    await this.organismesDatasService.findAndAddByIdRnaFromAllApi(idRef, sources)
    const organismeDatas = await this.organismesDatasService.findByIdRNA(idRef)

    if (organismeDatas?.length === 0) {
      throw new NotFoundException(`No datas for ${idRef}`)
    }

    let organisme = await this.findOneByIdRef(idRef)

    if (!organisme) {
      organisme = new Organisme()
    }
    // TODO: Manque une règle pour sélectionner l'organisme datas correcte
    if (!organisme.id || organisme.updateAt?.getTime() < organismeDatas[0].dataUpdateAt.getTime()) {
      // TODO: A revoir pour une solution pour instancier 1 fois le parser
      const parser = this.parserToOrganismes.getParser(organismeDatas[0].organismesSource.name)()

      organisme = parser.toOrganismeEntity(organisme, organismeDatas[0].dataJson)
      organisme.organismeDatas = organismeDatas
      return await this.repo.save(organisme)
    }
  }
}
