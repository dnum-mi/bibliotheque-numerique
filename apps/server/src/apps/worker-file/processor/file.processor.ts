import { InjectQueue, Process, Processor } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import {
  ComputeFeExcelJobPayload, DeleteS3FilesJobPayload,
  UploadDsFileJobPayload,
  UploadRnaFileJobPayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { Job, Queue } from 'bull'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { DsApiClient, File as TFile } from '@dnum-mi/ds-api-client'
import { eFileSourceLabel, eState, eFileTag, anonymisedFileValue } from '@biblio-num/shared'
import { S3Service } from '@/shared/modules/s3/s3.service'
import { FileService } from '@/modules/files/providers/file.service'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import { ALS_INSTANCE } from '@/shared/modules/als/als.module'
import { AsyncLocalStorage } from 'async_hooks'
import { AsyncLocalStore } from '@/shared/modules/als/async-local-store.type'
import { Inject } from '@nestjs/common'

@Processor(QueueName.file)
export class FileProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly dsApiService: DsApiClient,
    private readonly s3Service: S3Service,
    private readonly fileService: FileService,
    private readonly fieldService: FieldService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
    @Inject(ALS_INSTANCE)
    private readonly als?: AsyncLocalStorage<AsyncLocalStore>,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private async _getCorrespondingDsFile(
    job: Job<UploadDsFileJobPayload>,
  ): Promise<TFile> {
    this.logger.verbose('_getCorrespondingDsFile')
    const payload = job.data
    this.logger.debug(payload)
    let files: TFile[]
    switch (payload.file.sourceLabel) {
    case eFileSourceLabel['ds-attestation']:
      files = await this.dsApiService.dossierAttestation(payload.dsDossierId)
      break
    case eFileSourceLabel['ds-motivation']:
      files = await this.dsApiService.dossierMotivationAttachment(payload.dsDossierId)
      break
    default:
      files = await this.dsApiService.dossierFile(
        payload.dsDossierId,
        payload.file.sourceStringId,
        payload.parentSourceId,
      )
    }
    job.log(`nombre de fichiers trouvés: ${files?.length}`)
    job.log(`nom des fichiers trouvés: ${files?.map((f) => f.filename)}`)
    return files[payload.file.sourceIndex ?? 0] as TFile
  }

  @Process(eJobName.UploadDsFile)
  async uploadDsFile(job: Job<UploadDsFileJobPayload>): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.verbose('uploadDsFile processor')
      await this.fileService.updateState(job.data.file.id, eState.uploading)
      const dsFile = await this._getCorrespondingDsFile(job)
      this.logger.debug(dsFile)
      job.progress(30)
      // do not re-upload same file
      if (dsFile.checksum !== job.data.file.checksum) {
        this.logger.debug('New file to upload')
        const state = await this.s3Service
          .downloadAndUploadToS3(dsFile.url, job.data.file.uuid)
          .then(async () => {
            this.logger.log(
              `File ${job.data.file.uuid} uploaded to S3 (${job.data.file.originalLabel})`,
            )
            await this.fileService.copyDsFileInformation(
              job.data.file.id,
              dsFile,
            )
            return eState.uploaded
          })
          .catch(async (e) => {
            this.logger.error(e)
            if (job.data.fieldId) {
              await this.fieldService.repository.update(
                { id: job.data.fieldId },
                { stringValue: 'ERROR' },
              )
            }
            return eState.failed
          })
        await this.fileService.updateState(job.data.file.id, state)
      } else {
        this.logger.debug('File already existing in  S3')
        await this.fileService.updateState(job.data.file.id, eState.uploaded)
      }
      job.progress(90)
      if (job.data.file.tag === eFileTag.fe) {
        this.logger.debug('Adding excel job')
        await this.syncQueue.add(eJobName.ComputeFeExcel, {
          file: job.data.file,
        } as ComputeFeExcelJobPayload)
      }
      job.progress(100)
    })
  }

  @Process(eJobName.UploadRnaFile)
  async uploadRnaFile(job: Job<UploadRnaFileJobPayload>): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.verbose('uploadRnaFile processor')
      await this.fileService.updateState(job.data.file.id, eState.uploading)
      const state = await this.s3Service
        .downloadAndUploadToS3(job.data.rnaUrl, job.data.file.uuid)
        .then(async (byteSize) => {
          await this.fileService.repository.update(
            { id: job.data.file.id },
            { byteSize },
          )
          this.logger.log(
            `File ${job.data.file.uuid} uploaded to S3 (${job.data.file.label}) from RNA`,
          )
          return eState.uploaded
        })
        .catch(async (e) => {
          this.logger.error(e)
          return eState.failed
        })
      await this.fileService.updateState(job.data.file.id, state)
    })
  }

  @Process(eJobName.DeleteS3Files)
  async deleteS3Files(job: Job<DeleteS3FilesJobPayload>): Promise<void> {
    await this.als.run({ job }, async () => {
      this.logger.log('delete s3 files')
      for (const file of job.data.files) {
        if (file.label === anonymisedFileValue) {
          this.logger.debug(`Anonymised file ${file.uuid} to delete`)
          await this.s3Service.deleteFile(file.uuid)
        }
      }
    })
  }
}
