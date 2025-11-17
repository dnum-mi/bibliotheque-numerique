import {
  fieldCourrierFileIntitule,
  fieldPjIntitule,
} from '@/modules/demarches/objects/constants/maarch-champ.dictionary'
import {
  maarchChampsLabel,
  maarchPJLabel,
} from '@/modules/demarches/objects/constants/maarch-champ.enum'
import {
  CsvRow,
  DemandeAggregee,
} from '@/modules/demarches/objects/constants/maarch.types'
import { File } from '@/modules/files/objects/entities/file.entity'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { eFileTag, eState, FileTagKey } from '@biblio-num/shared'
import { Injectable } from '@nestjs/common'
import { generateChecksum, extractMimeType } from './utils/file-helper'

@Injectable()
export class FileBuilderService {
  private readonly TAG_MAPPINGS = {
    statut: eFileTag.status,
    statuts: eFileTag.status,
    'compte annuel': eFileTag.account,
    'comptes annuels': eFileTag.account,
    pv: eFileTag.pv,
    'procès verbal': eFileTag.pv,
    'proces verbal': eFileTag.pv,
    jugement: eFileTag.judgment,
    rapport: eFileTag.activityReport,
    cr: eFileTag.activityReport,
    'compte rendu': eFileTag.activityReport,
    'comptes resultats': eFileTag.activityReport,
    'compte de résultat': eFileTag.activityReport,
    financement: eFileTag.fe,
  }

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name)
  }

  createFileEntities(data: DemandeAggregee): File[] {
    const allFiles: File[] = []

    const piecesJointes = this.extractPiecesJointes(data)

    if (piecesJointes) {
      const pjFiles = piecesJointes
        .map((pj) => this._createPjFileEntity(pj))
        .filter((file) => file !== null) as File[]

      allFiles.push(...pjFiles)
    }

    const courrierFile = this._createCourrierFileEntity(data)
    if (courrierFile) {
      allFiles.push(courrierFile)
    }

    return allFiles
  }

  private extractPiecesJointes(data: DemandeAggregee): CsvRow[] | null {
    const piecesJointes = data[maarchChampsLabel.piecesJointes] as CsvRow[]

    if (!Array.isArray(piecesJointes)) {
      return null
    }

    return piecesJointes
  }

  private _createPjFileEntity(pieceJointe: CsvRow): File | null {
    if (!this._isValidPieceJointe(pieceJointe)) {
      this.logger.debug('Aucun fichier pièce jointe attachée.')
      return null
    }

    const file = new File()

    const filePath = pieceJointe[maarchPJLabel.cheminPj]
    const fileName = pieceJointe[maarchPJLabel.nomPj]

    file.label = pieceJointe[maarchPJLabel.intitulePj] || 'unknown file'
    file.originalLabel = pieceJointe[maarchPJLabel.nomPj]
    file.sourceUploadedAt = pieceJointe[maarchPJLabel.dateCreationPj]
    file.sourcePath = `${this._cleanPath(filePath)}/${fileName}`
    file.tag = this._determineFileTag(file.label)
    file.checksum = generateChecksum(file.label)
    file.byteSize = 0
    file.state = eState.queued
    file.mimeType = extractMimeType(file.label)
    file.sourceLabel = 'rna'
    file.sourceStringId = fieldPjIntitule.id

    return file
  }

  private _createCourrierFileEntity(data: DemandeAggregee): File | null {
    if (!this._isValidCourrierFile(data)) {
      this.logger.debug('Aucun fichier courrier (HTML) attaché.')
      return null
    }

    const file = new File()

    const filePath = data[maarchChampsLabel.cheminCourrier]
    const fileName = data[maarchChampsLabel.nomCourrier]

    file.label = data[maarchChampsLabel.nomCourrier]
    file.originalLabel = data[maarchChampsLabel.nomCourrier]
    file.sourceUploadedAt = data[maarchChampsLabel.dateCreationCourrier]
    file.sourcePath = `${this._cleanPath(filePath)}/${fileName}`
    file.tag = eFileTag.other
    file.checksum = generateChecksum(file.label)
    file.byteSize = 0
    file.state = eState.queued
    file.mimeType = extractMimeType(file.label)
    file.sourceLabel = 'rna'
    file.sourceStringId = fieldCourrierFileIntitule.id

    return file
  }

  private _isValidPieceJointe(pieceJointe: CsvRow): boolean {
    return (
      !!pieceJointe[maarchPJLabel.nomPj] &&
      !!pieceJointe[maarchPJLabel.cheminPj]
    )
  }

  private _isValidCourrierFile(data: CsvRow): boolean {
    return (
      !!data[maarchChampsLabel.nomCourrier] &&
      !!data[maarchChampsLabel.cheminCourrier]
    )
  }

  private _cleanPath(path: string): string {
    return path ? path.trim().replace(/\/+$/, '') : ''
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
}
