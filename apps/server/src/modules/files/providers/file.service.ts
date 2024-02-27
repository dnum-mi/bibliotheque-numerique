import { Injectable } from '@nestjs/common'
import { File } from '../objects/entities/file.entity'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import {
  SmallFileOutputDto,
  smallFileOutputKeys,
} from '@/modules/files/objects/dto/output/small-file-output.dto'
import {
  eFileMimeType,
  eState,
  FileTabTagKey,
  fileTabTags,
  StateKey,
  FileMimeTypeKey,
  FileTagKey,
} from '@biblio-num/shared'
import { ChampDescriptor, File as TFile } from '@dnum-mi/ds-api-client'
import { doesTextContainBnCode } from '@/shared/utils/bn-code.utils'
import { tagCodeDictionary } from '@/modules/files/objects/const/tag-dictionnary.const'
import { TagDefinition } from '@/modules/files/objects/types/tag-definition.type'
import { UpsertDsFileDto } from '@/modules/files/objects/dto/input/upsert-ds-file.dto'
import { v4 } from 'uuid'
import { FileFieldTypeHash } from '@/modules/files/objects/const/file-field-type-hash.const'

@Injectable()
export class FileService extends BaseEntityService<File> {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(File) protected repo: Repository<File>,
  ) {
    super(repo, logger, FileFieldTypeHash)
    this.logger.setContext(this.constructor.name)
  }

  //#region STATIC
  static fromContentTypeToMimeType(contentType: string): FileMimeTypeKey {
    switch (contentType) {
    case 'application/pdf':
      return eFileMimeType.pdf
    case 'image/jpeg':
      return eFileMimeType.jpeg
    case 'image/png':
      return eFileMimeType.png
    case 'application/msword':
      return eFileMimeType.doc
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      return eFileMimeType.docx
    case 'application/vnd.ms-excel':
      return eFileMimeType.xls
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      return eFileMimeType.xlsx
    default:
      return eFileMimeType.unknown
    }
  }

  static buildCompleteName(smallFile: SmallFileOutputDto): string {
    if (smallFile.mimeType === eFileMimeType.unknown) {
      const previousExtension = smallFile.originalLabel.match(/\.(\w+)$/)
      // TODO: handle unknown extension
      return `${smallFile.label}.${previousExtension?.[1] ?? 'unknown'}`
    }
    return `${smallFile.label}.${smallFile.mimeType}`
  }

  static getTagFromChampsDescriptor(
    champDescriptor: ChampDescriptor,
  ): FileTagKey | undefined {
    if (champDescriptor.description?.length) {
      const code = doesTextContainBnCode(champDescriptor.description)
      if (code) {
        const tagDefinition: TagDefinition = tagCodeDictionary[code]
        if (tagDefinition) {
          return tagDefinition.tag
        }
      }
    }
  }

  //#endregion

  //#region PRIVATE
  private async _findExistingFile(
    payload: UpsertDsFileDto,
  ): Promise<File | null> {
    this.logger.verbose('_findExistingFile')
    return this.repo.findOne({
      where: {
        sourceIndex: payload.sourceIndex,
        originalLabel: payload.originalLabel,
        dossier: { id: payload.dossierId },
        sourceStringId: payload.sourceStringId ?? null,
      },
    })
  }

  //#endregion

  //#region public
  async findOneWithUuid(uuid: string): Promise<SmallFileOutputDto> {
    this.logger.verbose('findOneWithUuid')
    this.logger.debug(`UUID: ${uuid}`)
    return this.findOneOrThrow({
      where: { uuid },
      select: smallFileOutputKeys,
    })
  }

  async createIfNew(payload: UpsertDsFileDto): Promise<File> {
    this.logger.verbose('createIfNew')
    const existingFile = await this._findExistingFile(payload)
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
        mimeType: eFileMimeType.unknown,
        label: payload.fileName || 'to-be-constructed',
        byteSize: -1,
        checksum: 'unknown',
        originalLabel: payload.originalLabel ?? 'to-be-constructed',
        uuid: v4(),
      })
    } else {
      await this.updateState(existingFile.id, eState.queued)
      return existingFile
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
  ): Promise<Record<FileTabTagKey, number>> {
    this.logger.verbose('getOrganismeFileSummary')
    const entries = await Promise.all(
      fileTabTags.map((tag) =>
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
    return Object.fromEntries(entries) as Record<FileTabTagKey, number>
  }

  //#endregion
}
