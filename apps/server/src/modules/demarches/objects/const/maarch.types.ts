import { type Express } from 'express'
import { MappingColumn } from '../dtos/mapping-column.dto'

export interface ImportFiles {
  demandes: Express.Multer.File[]
  annotations?: Express.Multer.File[]
  accusesReception?: Express.Multer.File[]
}

export interface ImportResult {
  demarcheId: number
  countDossiers: number
}

export type CsvRow = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface DemandeAggregee extends CsvRow {
  pieces_jointes: CsvRow[]
  annotations: string[]
  accuses_reception: CsvRow[]
}

export interface CsvParseOptions {
  columns: boolean
  delimiter: string
  skip_empty_lines: boolean
}

export interface RollbackResult {
  message: string
  deletedCount: number
}

export interface FileRawValue {
  byteSizeBigInt: string
  checksum: string
  contentType: string
  filename: string
  url: string
}

export interface ExtendedMappingColumn extends MappingColumn {
  csvColumnLabel?: string
  children?: ExtendedMappingColumnWithoutChildren[]
}

export type ExtendedMappingColumnWithoutChildren = Omit<ExtendedMappingColumn, 'children'>
