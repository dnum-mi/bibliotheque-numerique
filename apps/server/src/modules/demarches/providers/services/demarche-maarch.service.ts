import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Demarche } from '../../objects/entities/demarche.entity'
import { Organisme } from '@/modules/organismes/objects/organisme.entity'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CustomBullService } from '@/shared/modules/custom-bull/custom-bull.service'
import { CsvProcessorService } from './maarch/csv-processor.service'
import { DossierTransformerService } from './maarch/dossier-transformer.service'
import {
  DemandeAggregee,
  ImportFiles,
  ImportResult,
} from '../../objects/constants/maarch.types'
import {
  eIdentificationDemarche,
  eOrganismeType,
  eState,
} from '@biblio-num/shared'
import {
  fieldNumRna,
  maarchFieldMappingsArray,
} from '../../objects/constants/maarch-champ.dictionary'
import { SyncOneRnaOrganismeJobPayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { FileBuilderService } from './maarch/file-builder.service'

@Injectable()
export class DemarcheMaarchService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: LoggerService,
    private readonly customBullService: CustomBullService,
    private readonly csvProcessor: CsvProcessorService,
    private readonly dossierTransformer: DossierTransformerService,
    private readonly fileBuilder: FileBuilderService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  async importDemarche(
    files: ImportFiles,
    title: string,
  ): Promise<ImportResult> {
    this.logger.verbose('Starting demarches import')

    if (!files?.demandes) {
      throw new BadRequestException(
        'Demandes file are required.',
      )
    }

    return this.dataSource.transaction(async (transactionManager) => {
      const aggregatedData = this.csvProcessor.processFiles(files)
      if (!aggregatedData || aggregatedData.length === 0) {
        throw new BadRequestException(
          'No valid data found in the provided CSV files. Please check the file format and content.',
        )
      }

      const demarche = await this._createDemarche(
        title,
        transactionManager,
      )

      const dossiers = await this._processDossiers(
        aggregatedData,
        demarche,
        transactionManager,
      )
      if (!dossiers || dossiers.length === 0) {
        throw new BadRequestException(
          'No valid dossiers could be created from the provided data. Please verify the data format.',
        )
      }

      this.logger.log(
        `Successfully imported ${dossiers.length} dossiers.`,
      )

      return {
        demarcheId: demarche.id,
        countDossiers: dossiers.length,
      }
    })
  }

  async deleteImport(demarcheId: number): Promise<{ message: string }> {
    this.logger.warn(`Starting rollback for demarche : ${demarcheId}`)
    await this.dataSource.transaction(async (transactionManager) => {
      const repoDossier = transactionManager.getRepository(Dossier)
      const repoDemarche = transactionManager.getRepository(Demarche)

      const demarche = await repoDemarche.findOne({ where: { id: demarcheId } })
      if (!demarche) {
        throw new NotFoundException(`Demarche ${demarcheId} not found.`)
      }

      const dossiersDeleted = await repoDossier.delete({ demarcheId })
      this.logger.log(`${dossiersDeleted.affected} dossiers deleted.`)
      await repoDemarche.delete(demarcheId)
      this.logger.log(`Demarche ${demarcheId} deleted.`)
    })

    this.logger.log(
      `Rollback completed ${demarcheId}. Demarche ${demarcheId} and dossiers deleted.`,
    )
    return { message: 'Rollback successful!' }
  }

  private async _createDemarche(
    title: string,
    transactionManager: EntityManager,
  ): Promise<Demarche> {
    const repoDemarche = transactionManager.getRepository(Demarche)

    const demarche = repoDemarche.create({
      title,
      identification: eIdentificationDemarche.MAARCH,
      mappingColumns: maarchFieldMappingsArray,
      lastSynchronisedAt: new Date(),
    })

    return repoDemarche.save(demarche)
  }

  private async _processDossiers(
    aggregatedData: DemandeAggregee[],
    demarche: Demarche,
    transactionManager: EntityManager,
  ): Promise<Dossier[]> {
    const repoDossier = transactionManager.getRepository(Dossier)
    const repoOrganisme = transactionManager.getRepository(Organisme)

    const dossiers = await this.dossierTransformer.transformToEntities(
      aggregatedData,
      demarche,
    )

    if (!dossiers || dossiers.length === 0) {
      this.logger.warn('No dossiers could be created from the provided data.')
      return []
    }

    for (const [index, dossier] of dossiers.entries()) {
      const data = aggregatedData[index]

      await this._synchroniseOrganisme(dossier, repoOrganisme)
      dossier.files = this.fileBuilder.createFileEntities(data)
    }

    await repoDossier.save(dossiers, { chunk: 100 })

    return dossiers
  }

  private async _synchroniseOrganisme(
    dossier: Dossier,
    repoOrganisme: Repository<Organisme>,
  ): Promise<void> {
    this.logger.verbose(
      `Synchronization of the organisme for the dossier sourceId : ${dossier.id}`,
    )
    const rnaField = dossier.fields.find(
      (field) => field.sourceId === fieldNumRna.id,
    )
    if (!rnaField || !rnaField.stringValue) {
      this.logger.log(`No rna field for the dossier ${dossier.id}`)
      return
    }
    const rnaValue = rnaField.stringValue

    let organisme = await repoOrganisme.findOne({ where: { idRna: rnaValue } })
    if (!organisme) {
      this.logger.log(
        `Organisme not found for rna ${rnaValue}, creation in progress...`,
      )
      organisme = await repoOrganisme.save(
        repoOrganisme.create({
          idRna: rnaValue,
          type: eOrganismeType.ASSO,
          state: eState.queued,
        }),
      )
      this.logger.debug(
        `Adding Organisme sync for rna:  ${rnaValue} (with id: ${organisme.id})`,
      )
      await this.customBullService.addSyncOneRnaOrganismeJob({
        dossierId: dossier.id,
        fieldId: rnaField.id,
        rna: rnaValue,
      } satisfies SyncOneRnaOrganismeJobPayload)
    }

    dossier.organisme = organisme
  }
}
