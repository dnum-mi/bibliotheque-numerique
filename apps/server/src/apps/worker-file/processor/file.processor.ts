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

@Processor(QueueName.file)
export class FileProcessor {
  constructor(
    private readonly logger: LoggerService,
    private readonly dsApiService: DsApiClient,
    private readonly s3Service: S3Service,
    private readonly fileService: FileService,
    @InjectQueue(QueueName.sync) private readonly syncQueue: Queue,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private async _getCorrespondingDsFile(
    payload: UploadDsFileJobPayload,
  ): Promise<TFile> {
    let files: TFile[]
    switch (payload.file.sourceLabel) {
    case eFileSourceLabel['ds-champs']:
    case eFileSourceLabel['ds-message']:
      files = await this.dsApiService.dossierFile(
        payload.dsDossierId,
        payload.file.sourceStringId,
      )
      break
    case eFileSourceLabel['ds-attestation']:
      files = await this.dsApiService.dossierAttestation(payload.dsDossierId)
    }
    return files[payload.file.sourceIndex ?? 0] as TFile
  }

  @Process(eJobName.UploadDsFile)
  async uploadDsFile(job: Job<UploadDsFileJobPayload>): Promise<void> {
    await this.fileService.updateState(job.data.file.id, eState.uploading)
    const dsFile = await this._getCorrespondingDsFile(job.data)
    // do not re-upload same file
    if (dsFile.checksum !== job.data.file.checksum) {
      await this.fileService.copyDsFileInformation(job.data.file.id, dsFile)
      await this.s3Service
        .downloadAndUploadToS3(dsFile.url, job.data.file.uuid)
        .then(() => {
          this.fileService.updateState(job.data.file.id, eState.uploaded)
        })
        .catch((e) => {
          this.logger.error(e)
          this.fileService.updateState(job.data.file.id, eState.failed)
        })
    } else {
      await this.fileService.updateState(job.data.file.id, eState.uploaded)
    }
    if (job.data.file.tag === eFileTag['excel-fe']) {
      await this.syncQueue.add(eJobName.ComputeFeExcel, {
        file: job.data.file,
      } as ComputeFeExcelJobPayload)
    }
    job.finished()
  }
}
