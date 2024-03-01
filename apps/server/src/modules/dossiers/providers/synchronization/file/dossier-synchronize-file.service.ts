import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import {
  CustomChamp,
  DossierWithCustomChamp as TDossier,
  File as TFile,
  PieceJustificativeChamp,
} from '@dnum-mi/ds-api-client'
import { InjectQueue } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { Queue } from 'bull'
import { UploadDsFileJobPayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { eFileDsSourceLabel, FieldType } from '@biblio-num/shared'
import { FileService } from '@/modules/files/providers/file.service'
import { UpsertDsFileDto } from '@/modules/files/objects/dto/input/upsert-ds-file.dto'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { isNumber } from 'class-validator'
import { FieldService } from '@/modules/dossiers/providers/field.service'

@Injectable()
export class DossierSynchroniseFileService {
  constructor(
    private readonly logger: LoggerService,
    private readonly fileService: FileService,
    private readonly fieldService: FieldService,
    @InjectQueue(QueueName.file) private readonly fileQueue: Queue,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  private async _addSyncFileJob(
    payload: UpsertDsFileDto,
    dsDossierId: number,
    fieldId?: number,
  ): Promise<void> {
    this.logger.verbose('_addSyncFileJob')
    this.logger.debug(
      `Adding sync file for champ ${payload.sourceStringId} (index: ${payload.sourceIndex})`,
    )
    const file = await this.fileService.createIfNew(payload)
    if (isNumber(fieldId)) {
      await this.fieldService.updateOrThrow(fieldId, {
        stringValue: file.uuid,
      })
    }
    const jobPayload: UploadDsFileJobPayload = {
      file,
      dsDossierId,
      fieldId,
    }
    await this.fileQueue.add(eJobName.UploadDsFile, jobPayload)
  }

  private async synchroniseAllChamps(
    fields: Field[],
    dsDossierId: number,
    organismeId: number,
  ): Promise<void> {
    this.logger.verbose('synchroniseAllChamps')
    await Promise.all(
      fields
        .filter((field) => field.type === FieldType.file)
        .map((field: Field) => {
          const tag = FileService.getTagFromChampsDescriptor(
            (field.rawJson as CustomChamp).champDescriptor,
          )
          const pjc = field.rawJson as PieceJustificativeChamp
          const files = pjc.files?.length ? pjc.files : [pjc.file]
          return files
            .filter(f => !!f)
            .map((f: TFile, i: number) => {
              return this._addSyncFileJob(
                {
                  dossierId: field.dossierId,
                  sourceStringId: field.sourceId,
                  organismeId,
                  tag,
                  sourceIndex: i,
                  sourceLabel: eFileDsSourceLabel['ds-champ'],
                  originalLabel: f.filename,
                },
                dsDossierId,
                field.id,
              )
            })
        })
        .flat(),
    )
  }

  private async synchroniseMessages(
    dossier: TDossier,
    dossierId: number,
    organismeId: number,
  ): Promise<void> {
    this.logger.verbose('synchroniseMessages')
    await Promise.all(
      dossier.messages
        .filter((message) => message.attachments?.length || message.attachment)
        .map((message) => [...(message.attachments || []), message.attachment].map((a: TFile, index: number) =>
          this._addSyncFileJob(
            {
              dossierId,
              sourceStringId: message.id,
              organismeId,
              sourceLabel: eFileDsSourceLabel['ds-message'],
              sourceIndex: index,
              originalLabel: a.filename,
            },
            dossier.number,
          ),
        ))
        .flat(),
    )
  }

  private async synchroniseAttestation(
    dossier: TDossier,
    dossierId: number,
    organismeId: number,
  ): Promise<void> {
    if (dossier.attestation) {
      await this._addSyncFileJob(
        {
          dossierId,
          organismeId,
          sourceLabel: eFileDsSourceLabel['ds-attestation'],
          originalLabel: dossier.attestation.filename,
        },
        dossier.number,
      )
    }
  }

  public async synchroniseFiles(
    fields: Field[],
    dossier: TDossier,
    dossierId: number,
    organismeId?: number,
  ): Promise<void> {
    this.logger.verbose('synchroniseFiles')
    await Promise.all([
      this.synchroniseAllChamps(fields, dossier.number, organismeId),
      this.synchroniseMessages(dossier, dossierId, organismeId),
      this.synchroniseAttestation(dossier, dossierId, organismeId),
    ])
  }
}
