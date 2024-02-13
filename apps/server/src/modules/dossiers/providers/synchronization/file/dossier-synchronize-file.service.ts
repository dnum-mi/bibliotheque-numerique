import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import {
  isFileChamp,
  isRepetitionChamp,
} from '@/shared/modules/ds-api/objects/ds-champ.utils'
import {
  Champ,
  PieceJustificativeChamp,
  RepetitionChamp,
  Dossier as TDossier,
} from '@dnum-mi/ds-api-client'
import { InjectQueue } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { Queue } from 'bull'
import { UploadFilePayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { JobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'

@Injectable()
export class DossierSynchroniseFileService {
  constructor(
    private readonly logger: LoggerService,
    @InjectQueue(QueueName.file) private readonly fileQueue: Queue,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private _addSyncFileJob(payload: UploadFilePayload): void {
    this.logger.verbose('_addSyncFileJob')
    this.logger.debug(`Adding sync file for champ ${payload.originStringId} (index: ${payload.index})`)
    this.fileQueue.add(JobName.UploadFile, payload)
  }

  private _syncIfChampIsFileChamp(champ: Champ, dossierId: number): void {
    if (isFileChamp(champ)) {
      const fileChamp = champ as PieceJustificativeChamp
      if (fileChamp.files?.length) {
        fileChamp.files.map((f: never, i: number) =>
          this._addSyncFileJob({
            dossierDsId: dossierId,
            originStringId: champ.id,
            originType: 'ds-champ',
            index: i,
          }),
        )
      }
      if (fileChamp.file) {
        this._addSyncFileJob({
          dossierDsId: dossierId,
          originStringId: champ.id,
          originType: 'ds-champ',
        })
      }
    }
  }

  public synchroniseFiles(dossier: TDossier, dossierId: number): void {
    this.logger.verbose('synchroniseFiles')
    const allChamp = dossier.champs.concat(dossier.annotations)
    allChamp.forEach((champ: Champ) => {
      if (isRepetitionChamp(champ)) {
        ;(champ as RepetitionChamp).rows.forEach((row) => {
          (row.champs as Champ[]).forEach((champ: Champ) => {
            this._syncIfChampIsFileChamp(champ, dossierId)
          })
        })
      } else {
        this._syncIfChampIsFileChamp(champ, dossierId)
      }
    })
    dossier.messages.forEach((message) => {
      if (message.attachments?.length) {
        message.attachments.forEach((a: never, index: number) =>
          this._addSyncFileJob({
            dossierDsId: dossierId,
            originStringId: message.id,
            originType: 'ds-message',
            index,
          }),
        )
      }
    })
    if (dossier.attestation) {
      this._addSyncFileJob({
        dossierDsId: dossierId,
        originType: 'ds-attestation',
      })
    }
  }
}
