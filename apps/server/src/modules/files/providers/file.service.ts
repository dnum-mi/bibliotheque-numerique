import { FindOptionsWhere, In, Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { File } from '../objects/entities/file.entity'
import type { File as TFile, Dossier as TDossier } from '@dnum-mi/ds-api-client'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import {
  SmallFileOutputDto,
  smallFileOutputKeys,
  SmallFileOutputWithOrganismeDto,
  smallOrganisme,
} from '@/modules/files/objects/dto/output/small-file-output.dto'
import {
  eFileExtension,
  eState,
  StateKey,
  FileExtensionKey,
  eFileSourceLabel,
  iRnaDocument,
  FileTagKey,
  fileTags,
  eFileTag,
  FileDsSourceLabelKey,
  eFileDsSourceLabel,
  fileSourceLabels,
} from '@biblio-num/shared'
import { UpsertDsFileDto } from '@/modules/files/objects/dto/input/upsert-ds-file.dto'
import { v4 } from 'uuid'
import { FileFieldTypeHash } from '@/modules/files/objects/const/file-field-type-hash.const'
import { FieldCodeKey } from '@/modules/dossiers/objects/constante/field-code.enum'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import {
  dCodeToLabelsAndTag,
  formatDate,
} from '@/modules/files/objects/const/code-to-labels-and-tag.const'
import { UpsertRnaFileDto } from '@/modules/files/objects/dto/input/upser-rna-file.dto'
import { dRnaCodeToLabelAndTag, TLabelAndTag } from '@/modules/files/objects/const/rna-code-to-label-and-tag.const'
import { eFileStorageIn, FileStorageInKey } from '../objects/const/file-storage-in.enum'
import { S3Service } from '../../../shared/modules/s3/s3.service'

const dMimeTypeToExtensionDictionary: Record<string, FileExtensionKey> = {
  'application/pdf': eFileExtension.pdf,
  'image/jpeg': eFileExtension.jpeg,
  'image/png': eFileExtension.png,
  'application/msword': eFileExtension.doc,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    eFileExtension.docx,
  'application/vnd.ms-excel': eFileExtension.xls,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    eFileExtension.xlsx,
  default: eFileExtension.unknown,
} as const

@Injectable()
export class FileService extends BaseEntityService<File> {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(File) protected repo: Repository<File>,
    private readonly s3Service: S3Service,
  ) {
    super(repo, logger, FileFieldTypeHash)
    this.logger.setContext(this.constructor.name)
  }

  //#region STATIC
  static fromContentTypeToMimeType(mimeType: string): FileExtensionKey {
    return (
      dMimeTypeToExtensionDictionary[mimeType] ??
      dMimeTypeToExtensionDictionary.default
    )
  }

  static normalizedFilename (filename: string): string {
    console.log(filename)
    return filename
    // eslint-disable-next-line no-useless-escape
      .replace(/[\/\\:\*\?"<>|]/g, '_') // non autorisés dans les noms de fichiers sous Windows
      .replace(/[,;]/g, '_')
  }

  static buildCompleteName(smallFile: SmallFileOutputDto): string {
    const label = this.normalizedFilename(smallFile.label)

    if (smallFile.mimeType === eFileExtension.unknown) {
      const previousExtension = smallFile.originalLabel.match(/\.(\w+)$/)
      // TODO: handle unknown extension
      return `${label}.${this.normalizedFilename(previousExtension?.[1] ?? 'unknown')}`
    }
    return `${label}.${smallFile.mimeType}`
  }

  static computeLabelAndTag(
    target: Field,
    fieldCodeHash: Record<FieldCodeKey, Field>,
    dsDossier: TDossier,
  ): { label: string; tag: FileTagKey | null } {
    const __nothing = {
      tag: null,
      label: (target.rawJson as TFile).filename,
    }
    if (!target.code) {
      return __nothing
    }
    const element = dCodeToLabelsAndTag[target.code]
    if (!element) {
      return __nothing
    }
    return {
      tag: element.tag,
      label: element.labelFactory(fieldCodeHash, dsDossier),
    }
  }

  static computeLabelAndTagForOrganisme(
    dateDepot: string | Date | undefined,
    anneeDepot: string | undefined,
    element: TLabelAndTag,
  ): TLabelAndTag {
    const prefix = dateDepot
      ? formatDate(new Date(dateDepot))
      : anneeDepot ?? 'no-date'
    return {
      tag: element.tag,
      label: `${prefix}_${element.label}`,
    }
  }

  static computeLabelAndTagForRna(doc: iRnaDocument): {
    label: string
    tag: FileTagKey | null
  } {
    const element = dRnaCodeToLabelAndTag[doc.sous_type?.code]
    if (!element) {
      return {
        tag: eFileTag.other,
        label: `${doc.sous_type?.libelle ?? 'document inconnu'}`,
      }
    }

    return FileService.computeLabelAndTagForOrganisme(
      doc.date_depot,
      doc.annee_depot,
      element)
  }

  //#endregion

  //#region PRIVATE
  private async _findDsExistingFile(
    payload: UpsertDsFileDto,
  ): Promise<File | null> {
    this.logger.verbose('_findDsExistingFile')
    return this.repo.findOne({
      where: {
        sourceIndex: payload.sourceIndex,
        originalLabel: payload.originalLabel,
        dossier: { id: payload.dossierId },
        sourceStringId: payload.sourceStringId ?? null,
      },
      relations: ['dossier', 'organisme'],
      select: {
        dossier: {
          id: true,
        },
        organisme: {
          id: true,
        },
      },
    })
  }

  private async _findRnaExistingFile(
    payload: UpsertRnaFileDto,
  ): Promise<File | null> {
    this.logger.verbose(`_findRnaExistingFile (id: ${payload.sourceStringId})`)
    return this.repo.findOne({
      where: {
        organismeId: payload.organismeId,
        sourceStringId: payload.sourceStringId,
      },
      relations: ['organisme'],
      select: {
        organisme: {
          id: true,
        },
      },
    })
  }

  //#endregion

  //#region public
  async findOneWithUuid(uuid: string): Promise<SmallFileOutputDto | SmallFileOutputWithOrganismeDto> {
    this.logger.verbose('findOneWithUuid')
    this.logger.debug(`UUID: ${uuid}`)
    return this.findOneOrThrow({
      where: { uuid },
      relations: ['organisme'],
      select: {
        id: true, // Bug TypeOrm; id is need to query with relations
        ...(Object.fromEntries(smallFileOutputKeys.map(p => [p, true]))),
        organisme: Object.fromEntries(smallOrganisme.map(p => [p, true])),
      },
    })
  }

  async createFromDsIfNew(payload: UpsertDsFileDto): Promise<File> {
    this.logger.verbose('createFromDsIfNew')
    const existingFile = await this._findDsExistingFile(payload)
    if (!existingFile) {
      this.logger.debug('Creating new file')
      return this.createAndSave({
        dossier: { id: payload.dossierId },
        organisme: { id: payload.organismeId ?? null },
        sourceLabel: payload.sourceLabel,
        sourceIndex: payload.sourceIndex ?? null,
        sourceStringId: payload.sourceStringId ?? null,
        state: eState.queued,
        tag: payload.tag,
        mimeType: eFileExtension.unknown,
        label: payload.label || payload.originalLabel,
        byteSize: -1,
        checksum: 'unknown',
        originalLabel: payload.originalLabel ?? 'to-be-constructed',
        uuid: v4(),
      })
    } else {
      return await this.updateAndReturnById(existingFile.id, {
        state: eState.queued,
        label: payload.label || payload.originalLabel,
        tag: payload.tag,
        organismeId: payload.organismeId ?? null,
      })
    }
  }

  async createFromRnaIfNew(payload: UpsertRnaFileDto): Promise<File | null> {
    this.logger.verbose('createFromRnaIfNew')
    const existingFile = await this._findRnaExistingFile(payload)
    if (!existingFile) {
      this.logger.debug('Creating new file')
      return this.createAndSave({
        organisme: { id: payload.organismeId },
        sourceLabel: eFileSourceLabel.rna,
        sourceIndex: null,
        sourceStringId: payload.sourceStringId,
        state: eState.queued,
        tag: payload.tag,
        mimeType: eFileExtension.pdf,
        label: payload.label,
        byteSize: -1,
        checksum: 'unknown',
        originalLabel: 'no-orginal-label-from-rna',
        uuid: v4(),
      })
    } else {
      this.logger.debug('File already uploaded')
      return null
    }
  }

  async copyDsFileInformation(id: number, dsFile: TFile): Promise<void> {
    this.logger.verbose('copyDsFileInformation')
    this.logger.debug(dsFile)
    await this.repo.update(
      { id },
      {
        originalLabel: dsFile.filename,
        mimeType: FileService.fromContentTypeToMimeType(dsFile.contentType),
        byteSize: dsFile.byteSize || dsFile.byteSizeBigInt,
        checksum: dsFile.checksum,
      },
    )
  }

  async updateState(id: number, state: StateKey): Promise<void> {
    this.logger.verbose('updateState')
    await this.repo.update({ id }, { state })
  }

  async getOrganismeFileSummary(
    organismeId: number,
  ): Promise<Record<FileTagKey, number>> {
    this.logger.verbose('getOrganismeFileSummary')
    const entries = await Promise.all(
      fileTags
        .filter((tag) => tag !== eFileTag.fe)
        .map((tag) =>
          this.repo
            .count({
              where: {
                organisme: { id: organismeId },
                tag: tag as FileTagKey,
              },
            })
            .then((count) => [tag, count]),
        ),
    )
    return Object.fromEntries(entries) as Record<FileTagKey, number>
  }

  async getDossierFileSummary(
    dossierId: number,
    hasFullAccess: boolean,
  ): Promise<number> {
    this.logger.verbose('getDossierFileSummary')
    const sourceLabels = hasFullAccess
      ? fileSourceLabels
      : fileSourceLabels.filter((label: FileDsSourceLabelKey) =>
        !(eFileDsSourceLabel['ds-annotation'] === label || eFileDsSourceLabel['ds-message'] === label))

    return await this.repo
      .count({
        where: {
          dossierId,
          sourceLabel: In(sourceLabels),
        },
      })
  }

  async deleteFiles(arg: {
    organismeId?: number | null,
    dossierId?: number | null,
    storageIn?: FileStorageInKey | undefined,
  } = { organismeId: null, dossierId: null }): Promise<boolean> {
    const { organismeId, dossierId, storageIn } = arg
    if (
      (organismeId === null || organismeId === undefined) &&
      (dossierId === null || dossierId === undefined)) {
      return false
    }

    const where: FindOptionsWhere<File> = { organismeId, dossierId }
    if (storageIn) {
      where.storageIn = storageIn
    }
    const files = await this.repo.find({ where: { organismeId, dossierId, storageIn } })
    await Promise.all(files.map(async (file) => {
      if (storageIn === eFileStorageIn.S3) {
        await this.s3Service.deleteFile(file.uuid)
      }
      await this.repo.remove(file)
    }))
  }
  //#endregion

  async deleteByOrganismeIdOnly(organismeId: number): Promise<void> {
    this.logger.verbose('deleteByOrganismeId')
    await this.repo.delete({ organismeId, dossierId: null })
  }
}
