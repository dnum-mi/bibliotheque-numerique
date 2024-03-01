import { BadRequestException, Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Repository } from 'typeorm'
import { Dossier } from '../objects/entities/dossier.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LeanDossierOutputDto } from '@/modules/dossiers/objects/dto/lean-dossier-output.dto'

@Injectable()
export class DossierService extends BaseEntityService<Dossier> {
  constructor(
    @InjectRepository(Dossier) protected readonly repo: Repository<Dossier>,
    protected readonly logger: LoggerService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  async getOrganismeDossiers(
    organismeId: number,
  ): Promise<LeanDossierOutputDto[]> {
    if (isNaN(organismeId)) {
      throw new BadRequestException('Invalid organisme id.')
    }
    this.logger.verbose(`getOrganismeDossiers ${organismeId}`)
    return this.repo
      .createQueryBuilder('d')
      .innerJoinAndSelect(
        'd.demarche',
        'demarche',
        'demarche.id = d.demarcheId',
      )
      .innerJoin('d.organisme', 'organisme', 'organisme.id = d.organismeId')
      .where('organisme.id = :organismeId', { organismeId })
      .select(['d', 'demarche.title', 'demarche.id'])
      .getMany()
      .then(dossiers => {
        return dossiers.map(dossier => ({
          id: dossier.id,
          demarcheId: dossier.demarche.id,
          demarcheTitle: dossier.demarche.title,
          prefecture: dossier.prefecture,
          state: dossier.state,
          depotDate: dossier.dateDepot,
        }))
      })
  }

  async softDeleteDemarcheDossiers(demarcheId: number): Promise<void> {
    this.logger.verbose(`softDeleteDemarcheDossiers ${demarcheId}`)
    await this.repo.softDelete({ demarcheId })
  }
}
