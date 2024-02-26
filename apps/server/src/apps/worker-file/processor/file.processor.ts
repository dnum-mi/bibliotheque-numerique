import { InjectQueue, Process, Processor } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import {
  ComputeFeExcelJobPayload,
  UploadDsFileJobPayload,
} from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { Job, Queue } from 'bull'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { DsApiClient, File as TFile } from '@dnum-mi/ds-api-client'
import { eFileSourceLabel, eState, eFileTag } from '@biblio-num/shared'
import { S3Service } from '@/shared/modules/s3/s3.service'
import { FileService } from '@/modules/files/providers/file.service'
import { FieldService } from '@/modules/dossiers/providers/field.service'

@Processor(QueueName.file)
export class FileProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly dsApiService: DsApiClient,
    private readonly s3Service: S3Service,
    private readonly fileService: FileService,
    private readonly fieldService: FieldService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private async _getCorrespondingDsFile(
    payload: UploadDsFileJobPayload,
  ): Promise<TFile> {
    this.logger.verbose('_getCorrespondingDsFile')
    this.logger.debug(payload)
    let files: TFile[]
    if (payload.file.sourceLabel === eFileSourceLabel['ds-attestation']) {
      files = await this.dsApiService.dossierAttestation(payload.dsDossierId)
    } else {
      try {
        files = await this.dsApiService.dossierFile(
          payload.dsDossierId,
          payload.file.sourceStringId,
        )
      } catch (e) {
        console.log(e)
        throw e
      }
    }
    return files[payload.file.sourceIndex ?? 0] as TFile
  }

  @Process(eJobName.UploadDsFile)
  async uploadDsFile(job: Job<UploadDsFileJobPayload>): Promise<void> {
    this.logger.verbose('uploadDsFile processor')
    await this.fileService.updateState(job.data.file.id, eState.uploading)
    const dsFile = await this._getCorrespondingDsFile(job.data)
    this.logger.debug(dsFile)
    // do not re-upload same file
    if (dsFile.checksum !== job.data.file.checksum) {
      this.logger.debug('New file to upload')
      await this.fileService.copyDsFileInformation(job.data.file.id, dsFile)
      const state = await this.s3Service
        .downloadAndUploadToS3(dsFile.url, job.data.file.uuid)
        .then(async () => {
          this.logger.log(
            `File ${job.data.file.uuid} uploaded to S3 (${job.data.file.originalLabel})`,
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
    if (job.data.file.tag === eFileTag['excel-fe']) {
      this.logger.debug('Adding excel job')
      await this.syncQueue.add(eJobName.ComputeFeExcel, {
        file: job.data.file,
      } as ComputeFeExcelJobPayload)
    }
  }
}
