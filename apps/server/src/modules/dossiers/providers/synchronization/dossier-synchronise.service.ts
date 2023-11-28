import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { Repository } from 'typeorm'
import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { Dossier as TDossier } from '@dnum-mi/ds-api-client'
import { FieldService } from '../field.service'
import { InstructionTimesService } from '@/plugins/instruction_time/instruction_times/instruction_times.service'
import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import {
  IdentificationDemarche,
  Prefecture,
  PrefectureKeys,
} from '@biblio-num/shared'
import {
  DossierSynchroniseExcelService,
} from '@/modules/dossiers/providers/synchronization/excel/dossier-synchronise-excel.service'
import {
  DossierSynchroniseFileService,
} from '@/modules/dossiers/providers/synchronization/file/dossier-synchronize-file.service'
import {
  DossierSynchroniseOrganismeService,
} from '@/modules/dossiers/providers/synchronization/organisme/dossier-synchronise-organisme.service'

@Injectable()
export class DossierSynchroniseService extends BaseEntityService<Dossier> {
  constructor(
    @InjectRepository(Dossier) protected readonly repo: Repository<Dossier>,
    protected readonly logger: LoggerService,
    private readonly fieldService: FieldService,
    private readonly fileSynchroniseService: DossierSynchroniseFileService,
    private readonly excelSynchroniseService: DossierSynchroniseExcelService,
    private readonly organismeSynchroniseService: DossierSynchroniseOrganismeService,
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
    return Prefecture[finalLabel] ? finalLabel : null
  }

  async synchroniseOneDossier(
    originalJsonDossier: TDossier,
    demarche: Demarche,
  ): Promise<void> {
    this.logger.verbose('synchroniseOneDossier')
    const jsonDossier =
      await this.fileSynchroniseService.synchroniseFiles(originalJsonDossier)
    const prefecture = this._findPrefecture(jsonDossier)
    const upsert = await this.repo.upsert(
      {
        demarche: { id: demarche.id },
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
    const fields = await this.fieldService.overwriteFieldsFromDataJson(
      { ...jsonDossier, prefecture }, // TODO: find a more elegant way to have prefecture
      id,
      demarche.mappingColumns,
    )
    try {
      await this.organismeSynchroniseService.synchroniseOrganismes(id, fields)
    } catch (e) {
      this.logger.error("Couldn't link organisme to this dossier.")
      this.logger.error(e)
    }
    if (demarche.identification === IdentificationDemarche.FE) {
      await this.instructionTimeService.proccessByDossierId(id)
      await this.instructionTimeService.instructionTimeCalculation([id])
      await this.excelSynchroniseService.synchroniseExcel(id)
    }

    this.logger.log(
      `Successfully synchronised dossier ${id} (dsId: ${jsonDossier.number})`,
    )
  }
}
