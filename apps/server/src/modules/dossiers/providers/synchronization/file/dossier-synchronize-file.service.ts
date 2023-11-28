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
  Message,
  Dossier as TDossier,
  File as TFile,
} from '@dnum-mi/ds-api-client'
import { FileService } from '@/modules/files/providers/file.service'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class DossierSynchroniseFileService {
  constructor(private readonly logger: LoggerService,
              private readonly fileService: FileService,
              private readonly configService: ConfigService) {
    this.logger.setContext(this.constructor.name)
  }

  private async _copyDsFile(file: TFile): Promise<string> {
    this.logger.verbose('copyDsFile')
    const copy = await this.fileService.copyRemoteFile(
      file.url,
      file.checksum,
      file.byteSizeBigInt,
      file.contentType,
      file.filename,
    )
    return `${this.configService.get('protocol')}://${this.configService.get(
      'appHost',
    )}${this.configService.get('appPath')}/files/${copy.id}`
  }

  private async _formatFileMessage(originalMessage: Message): Promise<Message> {
    this.logger.debug('_formatFileMessage')
    const message = { ...originalMessage }
    if (originalMessage.attachments?.length) {
      await Promise.all(
        message.attachments.map(async (attachment) => {
          attachment.url = await this._copyDsFile
        }),
      )
    }
    return message
  }

  private async _formatFileChamp(originalChamp: Champ): Promise<Champ> {
    this.logger.debug(`_formatFileChamp (${originalChamp.label})`)
    const champ = { ...originalChamp }
    // eslint-disable-next-line dot-notation
    this.logger.debug(originalChamp['__typename'])
    if (isFileChamp(originalChamp)) {
      const fileChamp = originalChamp as PieceJustificativeChamp
      if (fileChamp.files?.length || fileChamp.file) {
        const files = [...(fileChamp.files ?? []), ...[fileChamp.file]].filter(
          (a) => !!a,
        )
        await Promise.all(
          files.map(async (file) => {
            file.url = await this._copyDsFile(file)
          }),
        )
      }
    } else if (isRepetitionChamp(originalChamp)) {
      const rChamp = champ as RepetitionChamp
      rChamp.rows = await Promise.all(
        rChamp.rows.map(async (row) => ({
          ...row,
          champs: await Promise.all(
            row.champs.map(
              async (champ: Champ) => await this._formatFileChamp(champ),
            ),
          ),
        })),
      )
    }
    return champ
  }

  public async synchroniseFiles(dossier: TDossier): Promise<TDossier> {
    this.logger.verbose('_formatFileData')
    return {
      ...dossier,
      champs: await Promise.all(
        dossier.champs.map(
          async (champ: Champ) => await this._formatFileChamp(champ),
        ),
      ),
      annotations: await Promise.all(
        dossier.annotations.map(
          async (champ: Champ) => await this._formatFileChamp(champ),
        ),
      ),
      messages: await Promise.all(
        dossier.messages.map(
          async (message) => await this._formatFileMessage(message),
        ),
      ),
    }
  }
}
