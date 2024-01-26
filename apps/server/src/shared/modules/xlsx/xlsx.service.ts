import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import * as XLSX from 'xlsx'
import { join } from 'path'
import { v4 } from 'uuid'
import { createReadStream, promises as fsPromises, type ReadStream } from 'fs'
import { FileService } from '@/modules/files/providers/file.service'
import { ConfigService } from '@nestjs/config'
import { ExcelData } from '@/shared/types/excel-data.type'
import { FileStorage } from '@/modules/files/objects/entities/file-storage.entity'
import stream, { Readable } from 'stream'

@Injectable()
export class XlsxService {
  constructor(
    protected readonly logger: LoggerService,
    private readonly configService: ConfigService,
    private readonly fileService: FileService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  generateXlsxFileWithMapHeader(data:object[], mappingHeader:Record<string, string>, columns:string[]): ReadStream {
    this.logger.verbose('generateXlsxFileWithMapHeader')
    const newData = data.map(d => Object.fromEntries(
      columns.map(c => [mappingHeader[c], d[c]]),
    ))
    return this.generateXlsxFile(newData)
  }

  generateXlsxFile(data: object[]): ReadStream {
    this.logger.verbose('generateXlsxFile')
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data)
    const wb: XLSX.WorkBook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Feuille 1')
    const tempFilename = join('/tmp', `export-${v4()}.xlsx`)
    this.logger.debug('file generated: ' + tempFilename)
    XLSX.writeFile(wb, tempFilename)
    const stream = createReadStream(tempFilename)
    stream.on('end', async () => {
      await fsPromises.unlink(tempFilename)
      this.logger.debug(`File ${tempFilename} deleted.`)
    })
    return stream
  }

  async readExcelFile(filePath: string): Promise<ExcelData> {
    this.logger.verbose('readExcelFile')
    this.logger.debug('filePath: ' + filePath)
    const stream = createReadStream(filePath)
    return await this.readExcelData(stream)
  }

  async readExcelFileFromS3(filePath: string): Promise<ExcelData> {
    this.logger.verbose('readExcelFileFromS3')
    this.logger.debug('filePath: ' + filePath)
    const fileStorageId = filePath.split('/').pop()!
    const file: { stream: stream.Readable; info: FileStorage } = await this.fileService.getFile(fileStorageId)
    if (file.info.mimeType !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      return []
    }
    return await this.readExcelData(file.stream)
  }

  async readExcelData(stream: Readable): Promise<ExcelData> {
    this.logger.verbose('readExcelData')
    const sheetName = this.configService.get<string>('excel-import.sheetName')
    const range = this.configService.get<string>('excel-import.range')

    const buffer = await this._streamToBuffer(stream)
    const workbook: XLSX.WorkBook = XLSX.read(buffer, { type: 'buffer' })
    const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName]
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`)
    }
    const jsonData: ExcelData = XLSX.utils.sheet_to_json(sheet, { range, header: 1 })
    const jsonDataClean: ExcelData = this._cleanData(jsonData)
    this.logger.verbose('File Data: ' + jsonDataClean)
    return jsonDataClean
  }

  _cleanData(data: ExcelData): ExcelData {
    this.logger.verbose('_cleanData')
    return data.filter(row => row.length > 0)
  }

  private async _streamToBuffer(stream: Readable): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: never[] = []
      stream.on('data', (chunk) => chunks.push(chunk as never))
      stream.on('error', reject)
      stream.on('end', () => resolve(Buffer.concat(chunks)))
    })
  }
}
