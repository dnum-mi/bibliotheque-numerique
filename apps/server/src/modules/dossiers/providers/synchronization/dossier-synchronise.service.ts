import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bull'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'
import { Queue } from 'bull'
import { DossierWithCustomChamp as TDossier } from '@dnum-mi/ds-api-client'

import {
  IdentificationDemarche,
  IdentificationDemarcheKeys,
  Prefecture,
  PrefectureKeys,
} from '@biblio-num/shared'

import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { DsChampType } from '@/shared/modules/ds-api/objects/ds-champ-type.enum'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { JobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import {
  SyncOneRnaOrganismePayload,
  SyncOneRnfOrganismePayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'

import { InstructionTimesService } from '@/modules/instruction_time/instruction_times.service'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import {
  DossierSynchroniseExcelService,
} from '@/modules/dossiers/providers/synchronization/excel/dossier-synchronise-excel.service'
import {
  DossierSynchroniseFileService,
} from '@/modules/dossiers/providers/synchronization/file/dossier-synchronize-file.service'

@Injectable()
export class DossierSynchroniseService extends BaseEntityService<Dossier> {
  constructor(
    @InjectRepository(Dossier) protected readonly repo: Repository<Dossier>,
    protected readonly logger: LoggerService,
    private readonly fieldService: FieldService,
    private readonly fileSynchroniseService: DossierSynchroniseFileService,
    private readonly excelSynchroniseService: DossierSynchroniseExcelService,
    private readonly instructionTimeService: InstructionTimesService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  private _findPrefecture(dossier: TDossier): PrefectureKeys | null {
    this.logger.verbose('_findPrefecture')
    const label = dossier.groupeInstructeur?.label ?? ''
    const startLabel = label.split('-')?.[0].trim() ?? ''
    const finalLabel = 'D' + startLabel
    const pref = Prefecture[finalLabel] ? finalLabel : null
    this.logger.debug(`Prefecture: ${pref}`)
    return pref
  }

  private async _upsertDossier(
    jsonDossier: TDossier,
    demarcheId: number,
    prefecture: PrefectureKeys | null,
  ): Promise<number> {
    this.logger.verbose('_upsertDossier')
    const upsert = await this.repo.upsert(
      {
        demarche: { id: demarcheId },
        sourceId: '' + jsonDossier.number,
        dsDataJson: jsonDossier,
        state: jsonDossier.state,
        dateDepot: jsonDossier.dateDepot,
        prefecture,
      },
      {
        conflictPaths: ['sourceId', 'demarche'],
        skipUpdateIfNoValuesChanged: true,
      },
    )
    const id = upsert.identifiers[0].id
    this.logger.debug(`Dossier ${id} upserted`)
    return id
  }

  private async _FESpecificity(
    id: number,
    identification: IdentificationDemarcheKeys,
  ): Promise<void> {
    this.logger.verbose('_FESpecificity')
    if (identification === IdentificationDemarche.FE) {
      this.logger.debug('This demarche is FE')
      await this.instructionTimeService.proccessByDossierId(id)
      await this.instructionTimeService.instructionTimeCalculation([id])
      await this.excelSynchroniseService.synchroniseExcel(id)
    }
  }

  private _synchroniseOrganismes(fields: Field[], dossierId: number): void {
    this.logger.verbose('_synchroniseOrganismes')
    const organismeField = fields.find((field: Field) => {
      return (
        field.stringValue.length &&
        ([DsChampType.RnaChamp, DsChampType.RnfChamp].includes(
          field.dsChampType,
        ) ||
          field.rawJson?.champDescriptor?.description.match(
            /.*#bn-rnf-field-bn#.*/,
          ))
      )
    })
    if (organismeField) {
      if (organismeField.dsChampType === DsChampType.RnaChamp) {
        this.logger.debug(
          'Adding Organisme sync for rna: ' + organismeField.stringValue,
        )
        this.syncQueue.add(JobName.SyncOneRnaOrganisme, {
          dossierId,
          rna: organismeField.stringValue,
        } as SyncOneRnaOrganismePayload)
      } else {
        this.logger.debug(
          'Adding Organisme sync for rnf: ' + organismeField.stringValue,
        )
        this.syncQueue.add(JobName.SyncOneRnfOrganisme, {
          dossierId,
          rnf: organismeField.stringValue,
        } as SyncOneRnfOrganismePayload)
      }
    }
  }

  async synchroniseOneDossier(
    jsonDossier: TDossier,
    demarche: Demarche,
  ): Promise<void> {
    this.logger.verbose('synchroniseOneDossier')
    const prefecture = this._findPrefecture(jsonDossier)
    const id = await this._upsertDossier(jsonDossier, demarche.id, prefecture)
    this.fileSynchroniseService.synchroniseFiles(jsonDossier, id)
    const fields = await this.fieldService.overwriteFieldsFromDataJson(
      { ...jsonDossier, prefecture }, // TODO: find a better way for prefecture
      id,
      demarche.mappingColumns,
    )
    this._synchroniseOrganismes(fields, id)
    await this._FESpecificity(id, demarche.identification)
  }
}
