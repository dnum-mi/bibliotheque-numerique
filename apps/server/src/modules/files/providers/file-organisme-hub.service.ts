import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'

import type {
  IDissolved,
  IFile,
  ISiafRnaOutput,
  IStatus,
} from '@biblio-num/shared'
import {
  eFileTag,
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

type tFileToRename = {
    file: IFile,
    dateDepot: string | Date | undefined,
    labelAndTag: TLabelAndTag,
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
    const fileFound = await this.findWithFilter({
      uuid: file.id,
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
      sourceStringId: file.id,
      uuid: file.id,
      byteSize: file.byteSize,
      checksum: file.checksum,
      mimeType: FileService.fromContentTypeToMimeType(file.mimeType),
      originalLabel: file.name,
    })
  }

  async synchroniseRnfStatus(
    status: IStatus,
    dateDepot: string | Date | undefined,
    fileCommon: tFileCommon,
  ): Promise<void> {
    if (!status?.file) {
      return
    }
    const { file } = status

    await this._checkAndCreateFile(
      file,
      dateDepot,
      dRnaCodeToLabelAndTag.STC,
      fileCommon,
    )
  }

  async synchroniseRnfDissolved(
    dissolved: IDissolved,
    dateDepot: string | Date | undefined,
    fileCommon: tFileCommon,
  ): Promise<void> {
    if (dissolved?.verbalProcess?.id) {
      await this._checkAndCreateFile(
        dissolved.verbalProcess,
        dateDepot,
        dRnaCodeToLabelAndTag.PV,
        fileCommon,
      )
    }
    if (dissolved?.mandatLetter?.id) {
      await this._checkAndCreateFile(
        dissolved.mandatLetter,
        dateDepot,
        { tag: eFileTag.other, label: 'lettre de mandat' },
        fileCommon,
      )
    }
    if (dissolved?.otherFiles?.length) {
      await Promise.all(dissolved.otherFiles.map((file) =>
        this._checkAndCreateFile(
          file,
          dateDepot,
          { tag: eFileTag.other, label: 'Autres piéces de dissolution' },
          fileCommon,
        ),
      ))
    }
  }

  getFilesFromRawRna(rawRna: ISiafRnaOutput):tFileToRename[] {
    let files: tFileToRename[] = []
    // STATUS
    if (rawRna.status?.file) {
      files.push({
        labelAndTag: dRnaCodeToLabelAndTag.STC,
        file: rawRna.status?.file,
        dateDepot: rawRna.status?.file?.rnaFile?.uploadAt || rawRna.updatedAt,
      })
    }
    // DISSOLUTION
    if (rawRna.dissolved?.verbalProcess) {
      files.push({
        labelAndTag: dRnaCodeToLabelAndTag.PV,
        file: rawRna.dissolved?.verbalProcess,
        dateDepot: rawRna.dissolved?.verbalProcess?.rnaFile?.uploadAt || rawRna.dissolved.dissolvedAt,
      })
    }
    if (rawRna.dissolved.mandatLetter) {
      files.push({
        labelAndTag: { tag: eFileTag.other, label: 'Lettre de mandat de dissolution' },
        file: rawRna.dissolved?.mandatLetter,
        dateDepot: rawRna.dissolved?.mandatLetter?.rnaFile?.uploadAt || rawRna.dissolved.dissolvedAt,
      })
    }
    if (rawRna.dissolved?.otherFiles?.length) {
      files = files.concat(rawRna.dissolved?.otherFiles.map(file => ({
        labelAndTag: { tag: eFileTag.other, label: 'Autres piéces de dissolution' },
        file,
        dateDepot: file.rnaFile?.uploadAt || rawRna.dissolved.dissolvedAt,
      })))
    }
    // Dirigeants
    if (rawRna.directors.file) {
      files.push({
        labelAndTag: dRnaCodeToLabelAndTag.LDC,
        file: rawRna.directors.file,
        dateDepot: rawRna.directors.file?.rnaFile.uploadAt || rawRna.updatedAt,
      })
    }
    // Autres PJs
    if (rawRna.files?.length) {
      files = files.concat(rawRna.files.map(file => ({
        file,
        labelAndTag: { tag: eFileTag.other, label: file.rnaFile?.typePiece || file.rnaFile?.typeRecepisse || 'Autre' },
        dateDepot: file.rnaFile?.uploadAt || rawRna.updatedAt,
      })))
    }
    return files
  }

  async checkAndCreateFiles(fileCommon: tFileCommon, files: tFileToRename[]): Promise<void> {
    for (const file of files) {
      await this._checkAndCreateFile(file.file, file.dateDepot, file.labelAndTag, fileCommon)
    }
  }
}
