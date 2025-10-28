import {
  maarchChampsLabel,
  MaarchEtatsValides,
  maarchPJLabel,
} from '@/modules/demarches/objects/constants/maarch-champ.enum'
import {
  CsvRow,
  DemandeAggregee,
  ImportFiles,
} from '@/modules/demarches/objects/constants/maarch.types'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { BadRequestException, Injectable } from '@nestjs/common'
import { parse } from 'csv-parse/sync'
import { type Express } from 'express'
import { DataFormatterService } from './data-formatter.service'

@Injectable()
export class CsvProcessorService {
  constructor(
    private readonly logger: LoggerService,
    private readonly dataFormatter: DataFormatterService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  processFiles(files: ImportFiles): DemandeAggregee[] {
    const demandesFile = files.demandes[0]
    const annotationsFile =
      files.annotations && files.annotations.length > 0
        ? files.annotations[0]
        : undefined

    this._validateFiles(demandesFile, annotationsFile)

    const demandesData = this._parseCsv(demandesFile.buffer)
    if (!demandesData || demandesData.length === 0) {
      this.logger.warn('No valid data found in demandes CSV file')
      return []
    }

    const finalDemandesData = this._extractFinalDemandes(demandesData)
    if (finalDemandesData.length === 0) {
      this.logger.warn('No final demandes found after filtering')
      return []
    }

    let annotationsMap = new Map<number, string[]>()

    if (annotationsFile) {
      const annotationsData = this._parseCsv(annotationsFile.buffer)
      if (annotationsData && annotationsData.length > 0) {
        annotationsMap = this._groupAnnotations(annotationsData)
      }
    }

    const demandesMap = this._groupDemandes(finalDemandesData)

    const mergedData = this._mergeData(demandesMap, annotationsMap)

    return mergedData
  }

  private _extractFinalDemandes(demandes: CsvRow[]): CsvRow[] {
    return demandes.filter((demande) =>
      MaarchEtatsValides.has(demande.etat_dossier),
    )
  }

  private _parseCsv(buffer: Buffer): CsvRow[] {
    return parse(buffer, {
      columns: true,
      delimiter: ';',
      skip_empty_lines: true,
    })
  }

  private _validateFiles(
    demandesFile: Express.Multer.File,
    annotationsFile?: Express.Multer.File,
  ): void {
    if (annotationsFile) {
      this._validateAnnotationsFile(annotationsFile)
    }
    this._validateDemandesFile(demandesFile)
  }

  private _validateAnnotationsFile(file: Express.Multer.File): void {
    const content = file.buffer.toString('utf-8')
    const header = content.split('\n')[0]

    if (!header.includes('res_id')) {
      throw new BadRequestException(
        'Annotations file must contain a "res_id" column.',
      )
    }
  }

  private _validateDemandesFile(file: Express.Multer.File): void {
    const content = file.buffer.toString('utf-8')
    const header = content.split('\n')[0]

    if (!header.includes('courrier')) {
      throw new BadRequestException(
        'Demandes file must contain a "courrier" column.',
      )
    }
  }

  private _groupDemandes(demandes: CsvRow[]): Map<number, DemandeAggregee> {
    const demandesMap = new Map<number, DemandeAggregee>()

    for (const row of demandes) {
      const courrierId = this.extractCourrierId(row)
      if (!courrierId) continue

      const formattedRow = this.formatDemandeRow(row)
      const pieceJointe = this._extractPieceJointe(formattedRow)

      if (!demandesMap.has(courrierId)) {
        this._createNewDemande(
          demandesMap,
          courrierId,
          formattedRow,
          pieceJointe,
        )
      } else if (pieceJointe) {
        this._addPieceJointe(demandesMap, courrierId, pieceJointe)
      }
    }

    return demandesMap
  }

  private extractCourrierId(row: CsvRow): number | null {
    const courrierId = parseInt(row.courrier, 10)
    return isNaN(courrierId) ? null : courrierId
  }

  private formatDemandeRow(row: CsvRow): CsvRow {
    const formatted = { ...row }

    formatted[maarchChampsLabel.telephone] =
      this.dataFormatter.formatPhoneNumber(row[maarchChampsLabel.telephone])
    formatted[maarchChampsLabel.prefecture] =
      this.dataFormatter.getPrefectureKey(row[maarchChampsLabel.prefecture])
    formatted[maarchChampsLabel.dateDeclaration] = this.dataFormatter.parseDate(
      row[maarchChampsLabel.dateDeclaration],
    )
    formatted[maarchChampsLabel.associationUnionFederation] =
      this.dataFormatter.parseBoolean(
        row[maarchChampsLabel.associationUnionFederation],
      )
    formatted[maarchChampsLabel.etatDossier] = this.dataFormatter.getStatus(
      row[maarchChampsLabel.etatDossier],
    )

    return formatted
  }

  private _extractPieceJointe(row: CsvRow): CsvRow | null {
    const pieceJointe = {}

    for (const col of Object.values(maarchPJLabel)) {
      if (row[col] !== undefined) {
        pieceJointe[col] = row[col]
      }
    }

    if (!pieceJointe[maarchPJLabel.intitulePj]) {
      return null
    }

    if (
      pieceJointe[maarchPJLabel.nomPj] &&
      pieceJointe[maarchPJLabel.intitulePj]
    ) {
      const intituleBase = this._removeFileExtension(
        pieceJointe[maarchPJLabel.intitulePj],
      )

      const nomPj = pieceJointe[maarchPJLabel.nomPj]
      const extension = this._extractionFileExtension(nomPj)
      const nomSansExtension = this._removeFileExtension(nomPj)

      pieceJointe[maarchPJLabel.intitulePj] =
        `${nomSansExtension}_${intituleBase}${extension}`.trim()
    }

    return pieceJointe
  }

  private _extractionFileExtension(filename: string): string {
    if (!filename) {
      return ''
    }

    const lastDotIndex = filename.lastIndexOf('.')
    if (lastDotIndex === -1 || lastDotIndex === filename.length - 1) {
      return ''
    }

    return filename.substring(lastDotIndex)
  }

  private _removeFileExtension(filename: string): string {
    if (!filename) return ''

    const lastDotIndex = filename.lastIndexOf('.')
    if (lastDotIndex === -1) {
      return filename
    }

    return filename.substring(0, lastDotIndex)
  }

  private _addPieceJointe(
    demandesMap: Map<number, DemandeAggregee>,
    courrierId: number,
    pieceJointe: CsvRow,
  ): void {
    const demande = demandesMap.get(courrierId)
    if (demande) {
      demande[maarchChampsLabel.piecesJointes].push(pieceJointe)
    }
  }

  private _createNewDemande(
    demandesMap: Map<number, DemandeAggregee>,
    courrierId: number,
    row: CsvRow,
    pieceJointe: CsvRow | null,
  ): void {
    const baseDemande = { ...row }

    for (const col of Object.values(maarchPJLabel)) {
      delete baseDemande[col]
    }

    const nouvelleDemande: DemandeAggregee = {
      ...baseDemande,
      pieces_jointes: pieceJointe ? [pieceJointe] : [],
      annotations: [],
    }

    demandesMap.set(courrierId, nouvelleDemande)
  }

  private _groupAnnotations(annotations: CsvRow[]): Map<number, string[]> {
    const annotationsMap = new Map<number, string[]>()

    for (const annotation of annotations) {
      const resId = parseInt(annotation.res_id, 10)
      if (isNaN(resId)) continue

      if (!annotationsMap.has(resId)) {
        annotationsMap.set(resId, [])
      }

      annotationsMap.get(resId).push(annotation.annotations_courrier)
    }

    return annotationsMap
  }

  private _mergeData(
    demandesMap: Map<number, DemandeAggregee>,
    annotationsMap: Map<number, string[]>,
  ): DemandeAggregee[] {
    annotationsMap.forEach((annotationsList, resId) => {
      const demande = demandesMap.get(resId)
      if (demande) {
        demande[maarchChampsLabel.annotation] = annotationsList
      }
    })

    return Array.from(demandesMap.values())
  }
}
