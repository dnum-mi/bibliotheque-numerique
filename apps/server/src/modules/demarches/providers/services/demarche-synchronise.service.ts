import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Repository } from 'typeorm'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Demarche } from '../../objects/entities/demarche.entity'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { InjectRepository } from '@nestjs/typeorm'
import {
  type ChampDescriptor,
  type Demarche as TDemarche,
  type Dossier as TDossier,
  DsApiClient,
} from '@dnum-mi/ds-api-client'
import { DemarcheService } from './demarche.service'
import { DossierSynchroniseService } from '../../../dossiers/providers/synchronization/dossier-synchronise.service'
import { getFixFieldsByIdentification } from '../../../dossiers/objects/constante/fix-field.dictionnary'
import {
  giveFormatFunctionRefFromDsChampType,
  giveTypeFromDsChampType,
  isRepetitionChampDescriptor,
} from '@/shared/modules/ds-api/objects/ds-champ.utils'
import {
  FieldSource,
  FieldSourceKeys,
  type IdentificationDemarcheKeys,
  MappingColumn,
  OrganismeTypeKeys,
} from '@biblio-num/shared'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { JobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { SyncOneDossierPayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'

@Injectable()
export class DemarcheSynchroniseService extends BaseEntityService<Demarche> {
  constructor(
    protected logger: LoggerService,
    private demarcheService: DemarcheService,
    @InjectRepository(Demarche) repo: Repository<Demarche>,
    private dsApiClient: DsApiClient,
    private dossierSynchroniseService: DossierSynchroniseService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  //#region private
  private async _synchroniseAllDossier(
    dossiers: TDossier[],
    demarcheId: number,
    fromScratch: boolean,
  ): Promise<void> {
    this.logger.verbose('_synchroniseAllDossier')
    for (const dossier of dossiers) {
      await this.syncQueue.add(JobName.SyncOneDossier, {
        demarcheId,
        dsDossierId: dossier.number,
        fromScratch,
      } as SyncOneDossierPayload)
    }
  }

  private _generateMappingColumns(
    dsDemarche: Partial<TDemarche>,
    originalMappingColumns: MappingColumn[] = [],
    identification?: IdentificationDemarcheKeys,
  ): MappingColumn[] {
    this.logger.verbose('_generateMappingColumns')
    const revision = dsDemarche.publishedRevision ?? dsDemarche.activeRevision
    if (!revision) {
      throw new Error('No revision found inside demarche.')
    }
    const originalRenameHash = Object.fromEntries(
      originalMappingColumns.map((omc) => [omc.id, omc.columnLabel]),
    )
    const __fromDescriptorsToMappingColumn = (
      cds: ChampDescriptor[],
      source: FieldSourceKeys,
    ): MappingColumn[] =>
      cds.map((cd: ChampDescriptor) => ({
        id: cd.id,
        originalLabel: cd.label,
        columnLabel: originalRenameHash[cd.id] || null,
        isHeader: cd.__typename === 'HeaderSectionChampDescriptor',
        formatFunctionRef: giveFormatFunctionRefFromDsChampType(cd),
        source,
        type: giveTypeFromDsChampType(cd.__typename, true),
        ...(isRepetitionChampDescriptor(cd)
          ? {
            children: __fromDescriptorsToMappingColumn(
                cd.champDescriptors as ChampDescriptor[],
                source,
            ),
          }
          : {}),
      }))

    const result = [
      ...getFixFieldsByIdentification(identification).map((ff) => ({
        ...ff,
        columnLabel: originalRenameHash[ff.id] || ff.columnLabel,
      })),
      ...__fromDescriptorsToMappingColumn(
        (revision.champDescriptors as ChampDescriptor[]) ?? [],
        FieldSource.champs,
      ),
      ...__fromDescriptorsToMappingColumn(
        (revision.annotationDescriptors as ChampDescriptor[]) ?? [],
        FieldSource.annotation,
      ),
    ]
    return result
  }

  //#endregion

  public async createAndSynchronise(
    dsId: number,
    identification: IdentificationDemarcheKeys | undefined,
    types: OrganismeTypeKeys[] | undefined,
  ): Promise<void> {
    this.logger.verbose('createAndSynchronise')
    const raw = await this.dsApiClient.demarcheDossierIds(dsId)
    const dossiers = raw.demarche.dossiers.nodes
    delete raw.demarche.dossiers
    if (!raw) {
      throw new NotFoundException(`Demarche with dsId ${dsId} not found.`)
    }
    if (await this.demarcheService.findByDsId(dsId)) {
      throw new BadRequestException(`Demarche with dsId ${dsId} already exist.`)
    }
    const demarche = await this.repo.save({
      lastSynchronisedAt: new Date(),
      title: raw.demarche.title,
      state: raw.demarche.state ?? 'no-state',
      types: types || [],
      mappingColumns: this._generateMappingColumns(
        raw.demarche,
        [],
        identification,
      ),
      dsDataJson: raw.demarche,
      identification,
    })
    await this._synchroniseAllDossier(dossiers, demarche.id, true)
  }

  public async synchroniseOneDemarche(
    demarcheId: number,
    fromScratch = false,
  ): Promise<void> {
    this.logger.verbose('synchroniseOneDemarche')
    const demarche = await this.demarcheService.findOneById(demarcheId)
    if (!demarche) {
      throw new NotFoundException(`Demarche with id ${demarcheId} not found.`)
    }
    const lastSyncronisedAt = fromScratch
      ? new Date(0)
      : demarche.lastSynchronisedAt
    const result = await this.dsApiClient.demarcheDossierIds(
      demarche.dsDataJson.number,
      lastSyncronisedAt,
    )
    const raw = result.demarche
    const dossiers = raw.dossiers.nodes
    delete raw.dossiers
    const toUpdate = {
      lastSynchronisedAt: new Date(),
      ...((raw.dateDerniereModification !== demarche.dsDataJson.dateDerniereModification || fromScratch)
        ? {
          title: raw.title,
          state: raw.state,
          types: demarche.types || [],
          mappingColumns: this._generateMappingColumns(
            raw,
            demarche.mappingColumns,
            demarche.identification,
          ),
          dsDataJson: raw,
        }
        : {}),
    }
    await this.repo.update({ id: demarche.id }, toUpdate)
    await this._synchroniseAllDossier(dossiers, demarche.id, fromScratch)
  }
}
