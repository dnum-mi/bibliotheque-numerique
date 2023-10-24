import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import * as XLSX from 'xlsx'
import stream, { Readable } from 'stream'
import { createReadStream } from 'fs'
import { ConfigService } from '@nestjs/config'
import { FileService } from '@/modules/files/providers/file.service'
import { FileStorage } from '@/modules/files/objects/entities/file-storage.entity'
import { ExcelData } from '@/shared/types/excel-data.type'

@Injectable()
export class ExcelService {
  constructor(
    protected logger: LoggerService,
    private configService: ConfigService,
    private fileService: FileService,
  ) {
    this.logger.setContext(this.constructor.name)
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
