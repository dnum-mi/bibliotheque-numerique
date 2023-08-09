import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { Repository } from 'typeorm'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { ConfigService } from '@nestjs/config'
import { Demarche } from '../objects/entities/demarche.entity'
import { BaseEntityService } from '../../../shared/base-entity/base-entity.service'
import { InjectRepository } from '@nestjs/typeorm'
import { OrganismeType, OrganismeTypeKeys, organismeTypeRegex } from '../objects/enums/organisme-type.enum'
import { DsApiClient } from '@dnum-mi/ds-api-client'
import { Demarche as TDemarche, Dossier as TDossier } from '@dnum-mi/ds-api-client/dist/@types/generated-types'
import { DemarcheService } from './demarche.service'
import { DossierSynchroniseService } from '../../dossiers/providers/dossier-synchronise.service'

@Injectable()
export class DemarcheSynchroniseService extends BaseEntityService<Demarche> {
  constructor (
    private configService: ConfigService,
    protected logger: LoggerService,
    private demarcheService: DemarcheService,
    @InjectRepository(Demarche) repo: Repository<Demarche>,
    private dsApiClient: DsApiClient,
    private dossierSynchroniseService: DossierSynchroniseService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  /* region private */
  private _findOrganismeType (dsDemarche: Partial<TDemarche>): OrganismeTypeKeys {
    this.logger.verbose('_findTypeOfOrganisme')
    for (const descriptor of dsDemarche.publishedRevision?.annotationDescriptors ?? []) {
      for (const [type, regex] of Object.entries(organismeTypeRegex)) {
        if (descriptor.label.includes('organisme') && descriptor.description.match(regex)) {
          return type
        }
      }
    }
    return OrganismeType.unknown
  }

  private async _synchroniseAllDossier (dossiers: TDossier[], demarcheId: number): Promise<void> {
    this.logger.verbose('_synchroniseAllDossier')
    await Promise.all(
      dossiers.map(
        async (dossier) =>
          await this.dossierSynchroniseService
            .synchroniseOneDossier(dossier, demarcheId)
            // we don't want one miss-synchronise dossier to interrupt the whole process
            .catch((err) => {
              this.logger.error(
                `Dossier ${dossier.id} (sourceId: ${dossier.number}) failed to synchronise: ${err.message}`,
              )
              this.logger.debug(err)
            }),
      ),
    )
  }

  private async _synchroniseOneDemarche (demarche: Demarche, dsId: number): Promise<void> {
    this.logger.verbose('_synchroniseOneDemarche')
    const result = await this.dsApiClient.demarcheDossierWithCustomChamp(dsId, demarche.lastSynchronisedAt)
    const raw = result.demarche
    const dossiers = [...raw.dossiers.nodes]
    delete raw.dossiers
    await this.repo.update(
      { id: demarche.id },
      {
        lastSynchronisedAt: new Date(),
        title: raw.title,
        state: raw.state,
        type: this._findOrganismeType(raw),
        dsDataJson: raw,
      },
    )
    await this._synchroniseAllDossier(dossiers, demarche.id)
  }

  /* endregion */

  public async createAndSynchronise (dsId: number): Promise<void> {
    this.logger.verbose('createAndSynchronise')
    const raw = await this.dsApiClient.demarcheDossierWithCustomChamp(dsId)
    if (!raw) {
      throw new NotFoundException(`Demarche with dsId ${dsId} not found.`)
    }
    if (await this.demarcheService.findByDsId(dsId)) {
      throw new BadRequestException(`Demarche with dsId ${dsId} already exist.`)
    }
    const dossiers = [...raw.demarche.dossiers.nodes]
    delete raw.demarche.dossiers
    this.logger.debug(raw.demarche)
    const demarche = await this.repo.save({
      lastSynchronisedAt: new Date(),
      title: raw.demarche.title,
      state: raw.demarche.state ?? 'no-state',
      type: this._findOrganismeType(raw.demarche),
      dsDataJson: raw.demarche,
    })
    await this._synchroniseAllDossier(dossiers, demarche.id)
  }

  public async synchroniseOneDemarche (dsId: number): Promise<void> {
    this.logger.verbose('synchroniseOneDemarche')
    const demarche = await this.demarcheService.findByDsId(dsId)
    if (!demarche) {
      throw new NotFoundException(`Demarche with dsId ${dsId} not found.`)
    }
    return this._synchroniseOneDemarche(demarche, dsId)
  }

  public async synchroniseAllDemarches (): Promise<void[]> {
    this.logger.verbose('synchroniseAllDemarches')
    const demarches = await this.repo.find()
    const promises = demarches.map((demarche) =>
      this._synchroniseOneDemarche(demarche, parseInt(demarche.dsDataJson.id)),
    )
    return Promise.all(promises)
  }
}
