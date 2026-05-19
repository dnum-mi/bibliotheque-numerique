import {
  fieldAccuseReceptionIntitule,
  fieldCourrierFileIntitule,
  fieldPjIntitule,
} from '@/modules/demarches/objects/const/maarch-champ.dictionary'
import {
  maarchAccuseLabel,
  maarchChampsLabel,
  maarchExtraFields,
  maarchPJLabel,
} from '@/modules/demarches/objects/const/maarch-champ.enum'
import {
  CsvRow,
  DemandeAggregee,
} from '@/modules/demarches/objects/const/maarch.types'
import { File } from '@/modules/files/objects/entities/file.entity'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { eFileExtension, eFileSourceLabel, eFileTag, eState, FileTagKey } from '@biblio-num/shared'
import { Injectable } from '@nestjs/common'
import { generateChecksum, extractMimeType } from './utils/file-helper'
import { ConfigService } from '@nestjs/config'
import * as path from 'node:path'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class FileBuilderService {
  private readonly FOLDER_COURRIER: string
  private readonly FOLDER_PJ: string
  private readonly FOLDER_ACCUSE_RECEPTION: string
  private readonly S3_ROOT_PATH: string
  private readonly TAG_MAPPINGS = {
    statut: eFileTag.status,
    statuts: eFileTag.status,
    'compte annuel': eFileTag.account,
    'comptes annuel': eFileTag.account,
    pv: eFileTag.pv,
    'procès verbal': eFileTag.pv,
    'proces verbal': eFileTag.pv,
    jugement: eFileTag.judgment,
    rapport: eFileTag.activityReport,
    cr: eFileTag.activityReport,
    'compte rendu': eFileTag.activityReport,
    'compte resultat': eFileTag.activityReport,
    'comptes resultat': eFileTag.activityReport,
    'compte de résultat': eFileTag.activityReport,
    'comptes de résultat': eFileTag.activityReport,
    'extrait de compte': eFileTag.activityReport,
    financement: eFileTag.fe,
  }

  constructor(
    private readonly logger: LoggerService,
    private readonly configService: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name)
    this.S3_ROOT_PATH = this.configService.get('file.maarchImportRootPath')
    this.FOLDER_COURRIER = this.configService.get(
      'file.maarchImportFolderCourrier',
    )
    this.FOLDER_PJ = this.configService.get(
      'file.maarchImportFolderPieceJointe',
    )
    this.FOLDER_ACCUSE_RECEPTION = this.configService.get(
      'file.maarchImportFolderAccuseReception',
    )
  }

  createFileEntities(data: DemandeAggregee): File[] {
    const allFiles: File[] = []

    const piecesJointes = this._extractCsvRows(data, maarchChampsLabel.piecesJointes)
    if (piecesJointes) {
      const pjFiles = piecesJointes
        .map((pj) => this._createPjFileEntity(pj))
        .filter((file) => file !== null) as File[]

      allFiles.push(...pjFiles)
    }

    const accusesReception = this._extractCsvRows(data, maarchExtraFields.accusesReception)
    if (accusesReception) {
      const accusesReceptionFiles = accusesReception
        .map((accuse) => this._createAccuseReceptionFileEntity(accuse))
        .filter((file) => file !== null) as File[]

      allFiles.push(...accusesReceptionFiles)
    }

    const courrierFile = this._createCourrierFileEntity(data)
    if (courrierFile) {
      allFiles.push(courrierFile)
    }

    return allFiles
  }

  private _extractCsvRows(
    data: DemandeAggregee,
    fieldKey: keyof DemandeAggregee,
  ): CsvRow[] | null {
    const value = data[fieldKey]

    return Array.isArray(value) ? (value as CsvRow[]) : null
  }

  private _createPjFileEntity(pieceJointe: CsvRow): File | null {
    if (!this._hasRequiredFields(pieceJointe, [maarchPJLabel.nomPj, maarchPJLabel.cheminPj])) {
      this.logger.debug('Aucun fichier pièce jointe attachée.')
      return null
    }

    const file = new File()

    const filePath = pieceJointe[maarchPJLabel.cheminPj]
    const fileName = pieceJointe[maarchPJLabel.nomPj]
    const fileIntitule = pieceJointe[maarchPJLabel.intitulePj]
    const mimeType = extractMimeType(fileName)
    const fileOriginalLabel = fileIntitule ? this._forceExtension(fileIntitule, mimeType) : fileName

    file.uuid = uuidv4()
    file.label = fileName
    file.originalLabel = fileOriginalLabel
    file.sourceUploadedAt = pieceJointe[maarchPJLabel.dateCreationPj]
    file.sourcePath = this._buildS3Path({
      subFolder: this.FOLDER_PJ,
      csvPath: filePath,
      fileName,
    })
    file.tag = this._determineFileTag(fileOriginalLabel)
    file.checksum = generateChecksum(fileName)
    file.byteSize = 0
    file.state = eState.queued
    file.mimeType = extractMimeType(fileName)
    file.sourceLabel = eFileSourceLabel.maarch
    file.sourceStringId = fieldPjIntitule.id

    return file
  }

  private _createCourrierFileEntity(data: DemandeAggregee): File | null {
    if (!this._hasRequiredFields(data, [maarchChampsLabel.nomCourrier, maarchChampsLabel.cheminCourrier])) {
      this.logger.debug('Aucun fichier courrier (HTML) attaché.')
      return null
    }

    const file = new File()

    const filePath = data[maarchChampsLabel.cheminCourrier]
    const originalFileName = data[maarchChampsLabel.nomCourrier]
    const pdfFileName = this._forceExtension(originalFileName, eFileExtension.pdf)

    file.uuid = uuidv4()
    file.label = pdfFileName
    file.originalLabel = pdfFileName
    file.sourceUploadedAt = data[maarchChampsLabel.dateCreationCourrier]
    file.sourcePath = this._buildS3Path({
      subFolder: this.FOLDER_COURRIER,
      csvPath: filePath,
      fileName: pdfFileName,
    })
    file.tag = eFileTag.other
    file.checksum = generateChecksum(pdfFileName)
    file.byteSize = 0
    file.state = eState.queued
    file.mimeType = eFileExtension.pdf
    file.sourceLabel = eFileSourceLabel.maarch
    file.sourceStringId = fieldCourrierFileIntitule.id

    return file
  }

  private _createAccuseReceptionFileEntity(accuse: CsvRow): File | null {
    if (!this._hasRequiredFields(accuse, [maarchAccuseLabel.filename, maarchAccuseLabel.path])) {
      this.logger.debug('Aucun fichier accusé de réception attaché.')
      return null
    }

    const file = new File()
    const filePath = accuse[maarchAccuseLabel.path]
    const originalFileName = accuse[maarchAccuseLabel.filename]
    const pdfFileName = this._forceExtension(originalFileName, eFileExtension.pdf)

    file.uuid = uuidv4()
    file.label = pdfFileName
    file.originalLabel = pdfFileName
    file.sourceUploadedAt = accuse[maarchAccuseLabel.sendDate]
      ? new Date(accuse[maarchAccuseLabel.sendDate])
      : new Date()
    file.sourcePath = this._buildS3Path({
      subFolder: this.FOLDER_ACCUSE_RECEPTION,
      csvPath: filePath,
      fileName: pdfFileName,
    })
    file.tag = eFileTag.other
    file.checksum = generateChecksum(pdfFileName)
    file.byteSize = 0
    file.state = eState.queued
    file.mimeType = eFileExtension.pdf
    file.sourceLabel = eFileSourceLabel.maarch
    file.sourceStringId = fieldAccuseReceptionIntitule.id

    return file
  }

  private _hasRequiredFields(
    data: CsvRow,
    keys: string[],
  ): boolean {
    return keys.every(key => !!data[key])
  }

  private _cleanPath(path: string): string {
    return path ? path.trim().replace(/^\/+|\/+$/g, '').replace(/\\/g, '/') : ''
  }

  private _determineFileTag(label: string): FileTagKey {
    if (!label) {
      return eFileTag.other
    }

    const lowerCaseLabel = label.toLowerCase()

    for (const [keyword, tag] of Object.entries(this.TAG_MAPPINGS)) {
      if (lowerCaseLabel.includes(keyword)) {
        return tag
      }
    }

    return eFileTag.other
  }

  private _buildS3Path({
    subFolder,
    csvPath,
    fileName,
  }: {
    subFolder: string
    csvPath: string
    fileName: string
  }): string {
    const cleanCsvPath = this._cleanPath(csvPath)
    return path.posix.join(
      this.S3_ROOT_PATH,
      subFolder,
      cleanCsvPath,
      fileName,
    )
  }

  private _forceExtension(fileName: string, fileExtension: string): string {
    const ext = `.${fileExtension}`
    if (!fileName) return ''
    const extension = path.extname(fileName)
    if (extension) {
      return fileName.replace(extension, ext)
    }
    return `${fileName}${ext}`
  }
}
