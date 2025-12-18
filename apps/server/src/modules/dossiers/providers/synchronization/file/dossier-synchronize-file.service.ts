import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import {
  DossierWithCustomChamp as TDossier,
  File as TFile,
  PieceJustificativeChamp,
  DossierState,
} from '@dnum-mi/ds-api-client'
import { InjectQueue } from '@nestjs/bull'
import { QueueName } from '@/shared/modules/custom-bull/objects/const/queues-name.enum'
import { Queue } from 'bull'
import { UploadDsFileJobPayload } from '@/shared/modules/custom-bull/objects/const/job-payload.type'
import { eJobName } from '@/shared/modules/custom-bull/objects/const/job-name.enum'
import { eFileDsSourceLabel, FieldSource, FieldType } from '@biblio-num/shared'
import { FileService } from '@/modules/files/providers/file.service'
import { UpsertDsFileDto } from '@/modules/files/objects/dto/input/upsert-ds-file.dto'
import { isNumber } from 'class-validator'
import { FieldService } from '@/modules/dossiers/providers/field.service'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { FieldCodeKey } from '@/modules/dossiers/objects/constante/field-code.enum'

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
    parentSourceId?: string,
  ): Promise<void> {
    this.logger.verbose('_addSyncFileJob')
    this.logger.debug(
      `Adding sync file for champ ${payload.sourceStringId} (index: ${payload.sourceIndex})`,
    )
    const file = await this.fileService.createFromDsIfNew(payload)
    if (isNumber(fieldId)) {
      await this.fieldService.updateOrThrow(fieldId, {
        stringValue: file.uuid,
      })
    }
    const jobPayload: UploadDsFileJobPayload = {
      file,
      dsDossierId,
      fieldId,
      parentSourceId,
    }
    await this.fileQueue.add(eJobName.UploadDsFile, jobPayload)
  }

  private async synchroniseAllChamps(
    fields: Field[],
    fieldCodeHash: Record<FieldCodeKey, Field>,
    dsDossier: TDossier,
    organismeRef: string,
  ): Promise<void[]> {
    this.logger.verbose('synchroniseAllChamps')
    return await Promise.all(
      fields
        .filter((field) => field.type === FieldType.file)
        .flatMap((field: Field) => {
          const tagAndLabel = FileService.computeLabelAndTag(
            field,
            fieldCodeHash,
            dsDossier,
          )
          const pjc = field.rawJson as PieceJustificativeChamp
          const parentField =
            field.parentId && fields.find((f) => f.id === field.parentId)
          const files = pjc.files?.length ? pjc.files : [pjc.file]
          return files
            ?.filter((f) => !!f)
            .flatMap((f: TFile, i: number) => {
              return this._addSyncFileJob(
                {
                  ...tagAndLabel,
                  dossierId: field.dossierId,
                  sourceStringId: pjc.id, // TODO: why not field.sourceId ?
                  organismeRef,
                  sourceIndex: i,
                  sourceLabel:
                    field.fieldSource === FieldSource.annotation
                      ? eFileDsSourceLabel['ds-annotation']
                      : eFileDsSourceLabel['ds-champ'],
                  originalLabel: f.filename,
                },
                dsDossier.number,
                field.id,
                parentField?.sourceId,
              )
            })
        }),
    )
  }

  private async synchroniseMessages(
    dossier: TDossier,
    dossierId: number,
    organismeRef: string,
  ): Promise<void[]> {
    this.logger.verbose('synchroniseMessages')
    return await Promise.all(
      dossier.messages
        .filter((message) => message.attachments?.length)
        .flatMap((message) =>
          message.attachments
            .flatMap((a: TFile, index: number) =>
              this._addSyncFileJob(
                {
                  dossierId,
                  sourceStringId: message.id,
                  organismeRef,
                  sourceLabel: eFileDsSourceLabel['ds-message'],
                  sourceIndex: index,
                  originalLabel: a.filename,
                },
                dossier.number,
              ),
            ),
        ),
    )
  }

  private async synchroniseAttestation(
    dossier: TDossier,
    dossierId: number,
    organismeRef: string,
  ): Promise<void> {
    if (dossier.attestation) {
      return await this._addSyncFileJob(
        {
          dossierId,
          organismeRef,
          sourceLabel: eFileDsSourceLabel['ds-attestation'],
          originalLabel: dossier.attestation.filename,
        },
        dossier.number,
      )
    }
  }

  private async synchroniseMotivationAttached(
    dossier: TDossier,
    dossierId: number,
    organismeRef: string,
  ): Promise<void> {
    if (dossier.motivationAttachment) {
      return await this._addSyncFileJob(
        {
          dossierId,
          organismeRef,
          sourceLabel: eFileDsSourceLabel['ds-motivation'],
          originalLabel: dossier.motivationAttachment.filename,
        },
        dossier.number,
      )
    }
  }

  public async synchroniseFiles(
    fields: Field[],
    dossier: TDossier,
    dossierId: number,
    organismeRef?: string,
  ): Promise<void> {
    this.logger.verbose('synchroniseFiles')
    const organismeIdForAcceptedDossier =
      dossier.state === DossierState.Accepte ? organismeRef : undefined
    this.logger.log(
      'organismeIdForAcceptedDossier: ' + organismeIdForAcceptedDossier,
    )
    const flatCodeFields = fields.flatMap((f) => [f, ...(f.children || [])])
    const fieldCodeHash = Object.fromEntries(
      fields.filter((f) => !!f.code).map((f) => [f.code, f]),
    ) as Record<FieldCodeKey, Field>
    await Promise.all([
      this.synchroniseAllChamps(
        flatCodeFields,
        fieldCodeHash,
        dossier,
        organismeIdForAcceptedDossier,
      ),
      this.synchroniseMessages(
        dossier,
        dossierId,
        organismeIdForAcceptedDossier,
      ),
      this.synchroniseAttestation(
        dossier,
        dossierId,
        organismeIdForAcceptedDossier,
      ),
      this.synchroniseMotivationAttached(
        dossier,
        dossierId,
        organismeIdForAcceptedDossier,
      ),
    ])
  }
}
