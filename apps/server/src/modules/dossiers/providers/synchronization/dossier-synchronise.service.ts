import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'
import { DossierWithCustomChamp as TDossier } from '@dnum-mi/ds-api-client'

import {
  IdentificationDemarche,
  IdentificationDemarcheKeys,
  Prefecture,
  PrefectureKeys,
} from '@biblio-num/shared'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { LoggerService } from '@/shared/modules/logger/logger.service'

import { InstructionTimesService } from '@/modules/instruction_time/instruction_times.service'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import {
  DossierSynchroniseFileService,
} from '@/modules/dossiers/providers/synchronization/file/dossier-synchronize-file.service'
import {
  DossierSynchroniseOrganismeService,
} from '@/modules/dossiers/providers/synchronization/organisme/dossier-synchronise-organisme.service'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'

@Injectable()
export class DossierSynchroniseService extends BaseEntityService<Dossier> {
  constructor(
    @InjectRepository(Dossier) protected readonly repo: Repository<Dossier>,
    protected readonly logger: LoggerService,
    private readonly fieldService: FieldService,
    private readonly fileSynchroniseService: DossierSynchroniseFileService,
    private readonly dossierSynchroniseOrganisme: DossierSynchroniseOrganismeService,
    private readonly instructionTimeService: InstructionTimesService,
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
    }
  }

  async synchroniseOneDossier(
    jsonDossier: TDossier,
    demarche: Demarche,
  ): Promise<void> {
    this.logger.verbose('synchroniseOneDossier')
    const prefecture = this._findPrefecture(jsonDossier)
    const id = await this._upsertDossier(jsonDossier, demarche.id, prefecture)
    const fields: Field[] = await this.fieldService.overwriteFieldsFromDataJson(
      { ...jsonDossier, prefecture }, // TODO: find a better way for prefecture
      id,
      demarche.mappingColumns,
    )
    const organismeId =
      await this.dossierSynchroniseOrganisme.synchroniseOrganismeFromFields(
        fields,
        id,
      )
    if (organismeId) {
      await this.repo.update({ id }, { organisme: { id: organismeId } })
    }
    await this.fileSynchroniseService.synchroniseFiles(fields, jsonDossier, id, organismeId)
    await this._FESpecificity(id, demarche.identification)
  }
}
