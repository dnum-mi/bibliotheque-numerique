import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'

import {
  IAssociationOutput,
  eFileTag,
  IFile,
  eTypeFile,
} from '@biblio-num/shared'
import { BaseEntityService } from '../../../shared/base-entity/base-entity.service'
import { File } from '../objects/entities/file.entity'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { InjectRepository } from '@nestjs/typeorm'
import { FileFieldTypeHash } from '../objects/const/file-field-type-hash.const'
import { tFileCommon } from '../objects/types/file-common.type'
import {
  dRnaCodeToLabelAndTag,
  TLabelAndTag,
} from '../objects/const/rna-code-to-label-and-tag.const'
import { FileService } from './file.service'
import { getTagForType } from '../objects/const/get-tag-for-file-type.const'

type tFileToRename = {
  file: IFile
  dateDepot: string | Date | undefined
  labelAndTag: TLabelAndTag
}
@Injectable()
export class FileOrganismeHubService extends BaseEntityService<File> {
  constructor(
    protected logger: LoggerService,
    @InjectRepository(File) protected repo: Repository<File>,
  ) {
    super(repo, logger, FileFieldTypeHash)
    this.logger.setContext(this.constructor.name)
  }

  private async _checkAndCreateFile(
    file: IFile,
    dateDepot: string | Date | undefined,
    labelAndTag: TLabelAndTag,
    fileCommon: tFileCommon,
  ): Promise<void> {
    const id = file._id
    const fileFound = await this.findWithFilter({
      uuid: id,
      organismeId: fileCommon.organismeId,
    })
    if (fileFound.length) {
      return
    }

    await this.createAndSave({
      ...fileCommon,
      ...FileService.computeLabelAndTagForOrganisme(
        dateDepot,
        undefined,
        labelAndTag,
      ),
      sourceStringId: id,
      uuid: id,
      byteSize: file.byteSize,
      checksum: file.checksum,
      mimeType: FileService.fromContentTypeToMimeType(file.mimeType),
      originalLabel: file.name,
    })
  }

  async synchroniseRnfFiles(
    files: IFile[],
    dateDepot: string | Date | undefined,
    fileCommon: tFileCommon,
  ): Promise<void> {
    if (!files.length) {
      return
    }

    for (const file of files) {
      const tag = getTagForType(file.typeFile)
      await this._checkAndCreateFile(
        file,
        dateDepot,
        { tag, label: file.typeFile },
        fileCommon,
      )
    }
  }

  getFilesFromRawRna(rawRna: IAssociationOutput): tFileToRename[] {
    return rawRna.files.map(file => {
      switch (file.typeFile) {
      case eTypeFile.Statuts:
        return {
          labelAndTag: dRnaCodeToLabelAndTag.STC,
          file,
          dateDepot: file.uploadedAt || file?.rnaFile?.uploadedAt,
        }
      case eTypeFile['Procès verbal']:
        return {
          labelAndTag: dRnaCodeToLabelAndTag.PV,
          file,
          dateDepot: file.uploadedAt || file.rnaFile.uploadedAt,
        }
      default:
        return {
          file,
          labelAndTag: {
            tag: eFileTag.other,
            label: file.name,
          },
          dateDepot: file.uploadedAt || file.rnaFile?.uploadedAt,
        }
      }
    })
  }

  async checkAndCreateFiles(
    fileCommon: tFileCommon,
    files: tFileToRename[],
  ): Promise<void> {
    for (const file of files) {
      await this._checkAndCreateFile(
        file.file,
        file.dateDepot,
        file.labelAndTag,
        fileCommon,
      )
    }
  }
}
