import { fieldPjIntitule } from '@/modules/demarches/objects/constants/maarch-champ.dictionary'
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
import {
  eFileTag,
  eState,
  FileTagKey,
} from '@biblio-num/shared'
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
    const piecesJointes = this.extractPiecesJointes(data)

    if (!piecesJointes) {
      return []
    }

    return piecesJointes
      .map((pj) => this._createFileEntity(pj))
      .filter((file) => file !== null) as File[]
  }

  private extractPiecesJointes(data: DemandeAggregee): CsvRow[] | null {
    const piecesJointes = data[maarchChampsLabel.piecesJointes] as CsvRow[]

    if (!Array.isArray(piecesJointes)) {
      return null
    }

    return piecesJointes
  }

  private _createFileEntity(
    pieceJointe: CsvRow,
  ): File | null {
    if (!this._isValidPieceJointe(pieceJointe)) {
      return null
    }

    const file = new File()

    file.label = pieceJointe[maarchPJLabel.intitulePj] || 'unknown file'
    file.originalLabel = pieceJointe[maarchPJLabel.nomPj]
    file.sourceUploadedAt = pieceJointe[maarchPJLabel.dateCreationPj]
    file.tag = this._determineFileTag(file.label)
    file.checksum = generateChecksum(file.label)
    file.byteSize = 0
    file.state = eState.uploaded
    file.mimeType = extractMimeType(file.label)
    file.sourceLabel = 'rna'
    file.sourceStringId = fieldPjIntitule.id

    return file
  }

  private _isValidPieceJointe(pieceJointe: CsvRow): boolean {
    return !!pieceJointe.nom_pj
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
