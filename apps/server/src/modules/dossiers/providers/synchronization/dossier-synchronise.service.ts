import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'
import { DossierWithCustomChamp as TDossier } from '@dnum-mi/ds-api-client'

import {
  eIdentificationDemarche,
  IdentificationDemarcheKey,
  Prefecture,
  PrefectureKey,
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
import {
  DossierSynchroniseExcelService,
} from '@/modules/dossiers/providers/synchronization/excel/dossier-synchronise-excel.service'
import { ProjectionManagerService } from '@/modules/projection/services/projection-manager/projection-manager.service'

@Injectable()
export class DossierSynchroniseService extends BaseEntityService<Dossier> {
  constructor(
    @InjectRepository(Dossier) protected readonly repo: Repository<Dossier>,
    protected readonly logger: LoggerService,
    private readonly fieldService: FieldService,
    private readonly fileSynchroniseService: DossierSynchroniseFileService,
    private readonly dossierSynchroniseOrganisme: DossierSynchroniseOrganismeService,
    private readonly instructionTimeService: InstructionTimesService,
    private readonly dossierSynchroniseExcelService: DossierSynchroniseExcelService,
    private readonly projectionManager: ProjectionManagerService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  private _findPrefecture(dossier: TDossier): PrefectureKey | null {
    this.logger.verbose('_findPrefecture')
    const label = dossier.groupeInstructeur?.label ?? ''
    const regexGroupInstructeur = /(\s*)(\d?\d[\dAB])(\s*)([-–])(.*)/
    const resultRegex = label.match(regexGroupInstructeur)
    if (!resultRegex) return null
    const startLabel = resultRegex[2]
    const finalLabel = 'D' + startLabel
    const pref = Prefecture[finalLabel] ? finalLabel : null
    this.logger.debug(`Prefecture: ${pref}`)
    return pref as PrefectureKey
  }

  private async _upsertDossier(
    jsonDossier: TDossier,
    demarcheId: number,
    prefecture: PrefectureKey | null,
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
        dateTraitement: jsonDossier.dateTraitement ?? null,
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
    identification: IdentificationDemarcheKey,
  ): Promise<void> {
    this.logger.verbose('_FESpecificity')
    if (identification === eIdentificationDemarche.FE) {
      this.logger.debug('This demarche is FE')
      await this.instructionTimeService.proccessByDossierId(id)
      await this.instructionTimeService.instructionTimeCalculation([id])
      await this.dossierSynchroniseExcelService.upsetFieldsAmounts(id, null)
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

    const organismeRefs = await this.dossierSynchroniseOrganisme.attachOrganismeRefsToFields(
      fields,
    )
    if (organismeRefs && organismeRefs.length) {
      await this.updateOrThrow(id, { organismeRefs })
    }

    await this.fileSynchroniseService.synchroniseFiles(
      fields,
      jsonDossier,
      id,
    )

    await this._FESpecificity(id, demarche.identification)
    await this.projectionManager.upsertDossierInProjections(demarche, id)
  }

  async addTitleOrganismeInFieldsByIDossier(dossierId: number): Promise<void> {
    this.logger.verbose('setTitleOrganismeInFields')
    const fields = await this.fieldService.findFieldOrganismeWithoutTitleByDossierId(
      dossierId,
    )
    if (!fields?.length) {
      this.logger.log('No organisme fields to update')
      return
    }
    const fieldsToUpdate = fields.filter(field => field.stringValue.length > 0 && !field.stringValue.includes(' | '))
    await Promise.allSettled(fieldsToUpdate
      .map(async (field) => {
        await this.dossierSynchroniseOrganisme.attachOrganismeRefToOneField(field)
      }))

    this.logger.log(`Updated ${fieldsToUpdate.length}/${fields.length} organisme fields.`)
  }
}
