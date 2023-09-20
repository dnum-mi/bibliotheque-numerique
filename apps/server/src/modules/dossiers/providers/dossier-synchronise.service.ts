import { Injectable } from '@nestjs/common'
import { LoggerService } from '../../../shared/modules/logger/logger.service'
import { Repository } from 'typeorm'
import { Dossier } from '../objects/entities/dossier.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { BaseEntityService } from '../../../shared/base-entity/base-entity.service'
import {
  Dossier as TDossier,
  File as TFile,
  RepetitionChamp,
  PieceJustificativeChamp,
  Champ,
  Message,
} from '@dnum-mi/ds-api-client'
import { ConfigService } from '@nestjs/config'
import { FileService } from '../../files/providers/file.service'
import { FieldService } from './field.service'
import { InstructionTimesService } from '../../../plugins/instruction_time/instruction_times/instruction_times.service'
import { Demarche } from '../../demarches/objects/entities/demarche.entity'
import { isFileChamp, isRepetitionChamp } from '../../../shared/modules/ds-api/objects/ds-champ.utils'
import { IdentificationDemarche } from '@biblio-num/shared'

@Injectable()
export class DossierSynchroniseService extends BaseEntityService<Dossier> {
  constructor (
    @InjectRepository(Dossier) protected readonly repo: Repository<Dossier>,
    protected readonly logger: LoggerService,
    private configService: ConfigService,
    private fileService: FileService,
    private fieldService: FieldService,
    private instructionTimeService: InstructionTimesService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  /* region private */
  private async copyDsFile (file: TFile): Promise<string> {
    this.logger.verbose('copyDsFile')
    const copy = await this.fileService.copyRemoteFile(
      file.url,
      file.checksum,
      file.byteSizeBigInt,
      file.contentType,
      file.filename,
    )
    return `${this.configService.get('protocol')}://${this.configService.get('appHost')}${this.configService.get(
      'appPath',
    )}/files/${copy.id}`
  }

  private async _formatFileMessage (originalMessage: Message): Promise<Message> {
    this.logger.debug('_formatFileMessage')
    const message = { ...originalMessage }
    if (originalMessage.attachments?.length) {
      await Promise.all(
        message.attachments.map(async (attachment) => {
          attachment.url = await this.copyDsFile
        }),
      )
    }
    return message
  }

  private async _formatFileChamp (originalChamp: Champ): Promise<Champ> {
    this.logger.debug(`_formatFileChamp (${originalChamp.label})`)
    const champ = { ...originalChamp }
    // eslint-disable-next-line dot-notation
    this.logger.debug(originalChamp['__typename'])
    if (isFileChamp(originalChamp)) {
      const fileChamp = originalChamp as PieceJustificativeChamp
      if (fileChamp.files?.length || fileChamp.file) {
        const files = [...(fileChamp.files ?? []), ...[fileChamp.file]].filter((a) => !!a)
        await Promise.all(
          files.map(async (file) => {
            file.url = await this.copyDsFile(file)
          }),
        )
      }
    } else if (isRepetitionChamp(originalChamp)) {
      const rChamp = champ as RepetitionChamp
      rChamp.rows = await Promise.all(
        rChamp.rows.map(async (row) => ({
          ...row,
          champs: await Promise.all(row.champs.map(async (champ: Champ) => await this._formatFileChamp(champ))),
        })),
      )
    }
    return champ
  }

  private async _formatFileData (dossier: TDossier): Promise<TDossier> {
    this.logger.verbose('_formatFileData')
    return {
      ...dossier,
      champs: await Promise.all(dossier.champs.map(async (champ: Champ) => await this._formatFileChamp(champ))),
      annotations: await Promise.all(
        dossier.annotations.map(async (champ: Champ) => await this._formatFileChamp(champ)),
      ),
      messages: await Promise.all(dossier.messages.map(async (message) => await this._formatFileMessage(message))),
    }
  }

  /* endregion */

  async synchroniseOneDossier (originalJsonDossier: TDossier, demarche: Demarche): Promise<void> {
    this.logger.verbose('synchroniseOneDossier')
    const jsonDossier = await this._formatFileData(originalJsonDossier)
    const upsert = await this.repo.upsert(
      {
        demarche: { id: demarche.id },
        sourceId: '' + jsonDossier.number,
        dsDataJson: jsonDossier,
        state: jsonDossier.state,
      },
      {
        conflictPaths: ['sourceId', 'demarche'],
        skipUpdateIfNoValuesChanged: true,
      },
    )
    const id = upsert.identifiers[0].id
    await this.fieldService.overwriteFieldsFromDataJson(jsonDossier, id, demarche.mappingColumns)
    if (demarche.identification === IdentificationDemarche.FE) {
      await this.instructionTimeService.proccessByDossierId(id)
      await this.instructionTimeService.instructionTimeCalculation([id])
    }
    this.logger.log(`Successfully synchronised dossier ${id} (dsId: ${jsonDossier.number})`)
  }
}
