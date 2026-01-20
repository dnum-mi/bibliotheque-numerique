import { Dossier } from '@/modules/dossiers/objects/entities/dossier.entity'
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Demarche } from '../../objects/entities/demarche.entity'
import { DataSource, EntityManager } from 'typeorm'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { CsvProcessorService } from './maarch/csv-processor.service'
import { DossierTransformerService } from './maarch/dossier-transformer.service'
import {
  DemandeAggregee,
  ImportFiles,
  ImportResult,
} from '../../objects/constants/maarch.types'
import { eIdentificationDemarche, eState } from '@biblio-num/shared'
import { maarchFieldMappingsArray } from '../../objects/constants/maarch-champ.dictionary'
import { FileBuilderService } from './maarch/file-builder.service'
import { File } from '@/modules/files/objects/entities/file.entity'
import { InjectQueue } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { Queue } from 'bull'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { UploadMaarchFileJobPayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { CustomBullService } from '../../../../shared/modules/custom-bull/custom-bull.service'

@Injectable()
export class DemarcheMaarchService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly logger: LoggerService,
    private readonly csvProcessor: CsvProcessorService,
    private readonly dossierTransformer: DossierTransformerService,
    private readonly fileBuilder: FileBuilderService,
    @InjectQueue(QueueName.file) private readonly fileQueue: Queue,
    private readonly customBullService: CustomBullService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  async importDemarche(
    files: ImportFiles,
    title: string,
  ): Promise<ImportResult> {
    this.logger.verbose('Starting demarches import')

    if (!files?.demandes) {
      throw new BadRequestException('Demandes file are required.')
    }

    let dossiersCreated: Dossier[] = []
    let demarcheIdResult: number | null = null

    await this.dataSource.transaction(async (transactionManager) => {
      const aggregatedData = this.csvProcessor.processFiles(files)
      if (!aggregatedData || aggregatedData.length === 0) {
        throw new BadRequestException(
          'No valid data found in the provided CSV files. Please check the file format and content.',
        )
      }

      const demarche = await this._createDemarche(title, transactionManager)

      dossiersCreated = await this._processDossiers(
        aggregatedData,
        demarche,
        transactionManager,
      )
      if (!dossiersCreated || dossiersCreated.length === 0) {
        throw new BadRequestException(
          'No valid dossiers could be created from the provided data. Please verify the data format.',
        )
      }

      demarcheIdResult = demarche.id
      this.logger.log(
        `Successfully imported ${dossiersCreated.length} dossiers.`,
      )
    })

    if (dossiersCreated && dossiersCreated.length > 0) {
      this.logger.log(
        `Dispatching S3 sync jobs for ${dossiersCreated.length} dossiers.`,
      )
      const pFiles = this._synchroniseFiles(dossiersCreated)
      const pFixOrganismes = dossiersCreated.map((dossier) =>
        this.customBullService.addSyncFixOrganismeOfOneDossierJob({
          dossierId: dossier.id,
        }),
      )

      await Promise.allSettled([
        pFiles,
        pFixOrganismes,
      ].flat())
    }

    return {
      demarcheId: demarcheIdResult!,
      countDossiers: dossiersCreated.length,
    }
  }

  async deleteImport(demarcheId: number): Promise<{ message: string }> {
    this.logger.warn(`Starting rollback for demarche : ${demarcheId}`)
    await this.dataSource.transaction(async (transactionManager) => {
      const repoDossier = transactionManager.getRepository(Dossier)
      const repoDemarche = transactionManager.getRepository(Demarche)

      const demarche = await repoDemarche.findOne({
        where: { id: demarcheId },
      })
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

      dossier.files = this.fileBuilder.createFileEntities(data)
    }

    return repoDossier.save(dossiers, { chunk: 100 })
  }

  private async _synchroniseFiles(dossiers: Dossier[]): Promise<void> {
    const allFilesToSync: File[] = dossiers.flatMap(
      (dossier) => dossier.files || [],
    )

    this.logger.log(`Found ${allFilesToSync.length} files to sync.`)

    for (const file of allFilesToSync) {
      if (file.state === eState.queued && file.sourcePath) {
        await this.fileQueue.add(eJobName.UploadMaarchFile, {
          file,
        } as UploadMaarchFileJobPayload)
      }
    }

    this.logger.log(`Dispatched ${allFilesToSync.length} S3 sync jobs.`)
  }
}
