import {
  maarchChampsLabel,
  MaarchEtatsValides,
  maarchExtraFields,
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
  private readonly fileSchemas: Record<string, { columns: string[], label: string }> = {
    demandes: { columns: ['courrier'], label: 'Demandes' },
    annotations: { columns: ['res_id', 'annotations_courrier'], label: 'Annotations' },
    accusesReception: { columns: ['res_id', 'filename'], label: 'Accusés de réception' },
  }

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
    const accusesReceptionFile = files.accusesReception && files.accusesReception.length > 0
      ? files.accusesReception[0]
      : undefined

    this._validateFiles(demandesFile, annotationsFile, accusesReceptionFile)

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
    let accusesReceptionMap = new Map<number, CsvRow[]>()

    if (annotationsFile) {
      const annotationsData = this._parseCsv(annotationsFile.buffer)
      if (annotationsData && annotationsData.length > 0) {
        annotationsMap = this._groupByResId(
          annotationsData,
          (a) => a.annotations_courrier,
        )
      }
    }

    if (accusesReceptionFile) {
      const accusesReceptionData = this._parseCsv(accusesReceptionFile.buffer)
      if (accusesReceptionData && accusesReceptionData.length > 0) {
        accusesReceptionMap = this._groupByResId(accusesReceptionData)
      }
    }

    const demandesMap = this._groupDemandes(finalDemandesData)

    const mergedData = this._mergeData(demandesMap, annotationsMap, accusesReceptionMap)

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
      bom: true,
    })
  }

  private _validateFiles(
    demandesFile: Express.Multer.File,
    annotationsFile?: Express.Multer.File,
    accusesReceptionFile?: Express.Multer.File,
  ): void {
    if (annotationsFile) {
      this._validateFileHeaders(
        annotationsFile,
        this.fileSchemas.annotations.columns,
        this.fileSchemas.annotations.label,
      )
    }
    if (accusesReceptionFile) {
      this._validateFileHeaders(
        accusesReceptionFile,
        this.fileSchemas.accusesReception.columns,
        this.fileSchemas.accusesReception.label,
      )
    }
    this._validateFileHeaders(
      demandesFile,
      this.fileSchemas.demandes.columns,
      this.fileSchemas.demandes.label,
    )
  }

  private _validateFileHeaders(
    file: Express.Multer.File,
    requiredColumns: string[],
    contextName: string,
  ): void {
    const header = file.buffer.toString('utf-8').split('\n')[0]

    const missingColumns = requiredColumns.filter(col => !header.includes(col))

    if (missingColumns.length > 0) {
      throw new BadRequestException(
        `${contextName} file is missing required columns: ${missingColumns.join(', ')}.`,
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

    return pieceJointe
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
      accuses_reception: [],
    }

    demandesMap.set(courrierId, nouvelleDemande)
  }

  private _groupByResId<T, R = T>(
    data: T[],
  valueSelector: (item: T) => R = (item) => item as unknown as R,
  ): Map<number, R[]> {
    const map = new Map<number, R[]>()

    for (const item of data) {
      const resId = parseInt((item as unknown as { res_id: string }).res_id, 10)

      if (isNaN(resId)) continue

      if (!map.has(resId)) {
        map.set(resId, [])
      }

    map.get(resId)!.push(valueSelector(item))
    }

    return map
  }

  private _mergeData(
    demandesMap: Map<number, DemandeAggregee>,
    annotationsMap: Map<number, string[]>,
    accusesReceptionMap: Map<number, CsvRow[]>,
  ): DemandeAggregee[] {
    demandesMap.forEach((demande, resId) => {
      demande[maarchChampsLabel.annotation] = annotationsMap.get(resId) || []
      demande[maarchExtraFields.accusesReception] = accusesReceptionMap.get(resId) || []
    })
    return Array.from(demandesMap.values())
  }
}
