import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import {
  isFileChamp,
  isRepetitionChamp,
} from '@/shared/modules/ds-api/objects/ds-champ.utils'
import {
  CustomChamp,
  PieceJustificativeChamp,
  RepetitionChamp,
  DossierWithCustomChamp as TDossier,
} from '@dnum-mi/ds-api-client'
import { InjectQueue } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { Queue } from 'bull'
import { UploadDsFileJobPayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'

import { eFileDsSourceLabel } from '@biblio-num/shared'
import { FileService } from '@/modules/files/providers/file.service'
import { UpsertDsFileDto } from '@/modules/files/objects/dto/input/upsert-ds-file.dto'

@Injectable()
export class DossierSynchroniseFileService {
  constructor(
    private readonly logger: LoggerService,
    private readonly fileService: FileService,
    @InjectQueue(QueueName.file) private readonly fileQueue: Queue,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private async _addSyncFileJob(payload: UpsertDsFileDto, dsDossierId: number): Promise<void> {
    this.logger.verbose('_addSyncFileJob')
    this.logger.debug(`Adding sync file for champ ${payload.sourceStringId} (index: ${payload.sourceIndex})`)
    const file = await this.fileService.createIfNew(payload)
    const jobPayload: UploadDsFileJobPayload = {
      file,
      dsDossierId,
    }
    this.fileQueue.add(eJobName.UploadDsFile, jobPayload)
  }

  private _syncIfChampIsFileChamp(champ: CustomChamp, dossierId: number, dsDossierId: number): void {
    if (isFileChamp(champ)) {
      // TODO: Cannot cast CustomChamp into a specific champ anymore. Used to work with Champ. Why ?
      const fileChamp = champ as unknown as PieceJustificativeChamp
      if (fileChamp.files?.length) {
        const tag = FileService.getTagFromChampsDescriptor(champ.champDescriptor)
        fileChamp.files.map((f: never, i: number) =>
          this._addSyncFileJob({
            dossierId,
            sourceStringId: champ.id,
            tag,
            sourceLabel: eFileDsSourceLabel['ds-champ'],
            sourceIndex: i,
          }, dsDossierId),
        )
      }
      if (fileChamp.file) {
        this._addSyncFileJob({
          dossierId,
          sourceStringId: champ.id,
          sourceLabel: eFileDsSourceLabel['ds-champ'],
        }, dsDossierId)
      }
    }
  }

  public synchroniseFiles(dossier: TDossier, dossierId: number): void {
    this.logger.verbose('synchroniseFiles')
    const allChamp = dossier.champs.concat(dossier.annotations)
    allChamp.forEach((champ: CustomChamp) => {
      if (isRepetitionChamp(champ)) {
        // TODO: Cannot cast CustomChamp into a specific champ anymore. Used to work with Champ. Why ?
        ;(champ as unknown as RepetitionChamp).rows.forEach((row) => {
          (row.champs as CustomChamp[]).forEach((champ: CustomChamp) => {
            this._syncIfChampIsFileChamp(champ, dossierId, dossier.number)
          })
        })
      } else {
        this._syncIfChampIsFileChamp(champ, dossierId, dossier.number)
      }
    })
    dossier.messages.forEach((message) => {
      if (message.attachments?.length) {
        message.attachments.forEach((a: never, index: number) =>
          this._addSyncFileJob({
            dossierId,
            sourceStringId: message.id,
            sourceLabel: eFileDsSourceLabel['ds-message'],
            sourceIndex: index,
          }, dossier.number),
        )
      }
    })
    if (dossier.attestation) {
      this._addSyncFileJob({
        dossierId,
        sourceLabel: eFileDsSourceLabel['ds-attestation'],
      }, dossier.number)
    }
  }
}
