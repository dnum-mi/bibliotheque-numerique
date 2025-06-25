import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'

import type {
  IDissolved,
  IFile,
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

@Injectable()
export class FileFoundationService extends BaseEntityService<File> {
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
          { tag: eFileTag.other, label: 'dissolution' },
          fileCommon,
        ),
      ))
    }
  }
}
