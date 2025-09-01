import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import * as XLSX from 'xlsx'
import { join } from 'path'
import { v4 } from 'uuid'
import { createReadStream, promises as fsPromises, type ReadStream } from 'fs'
import { ExcelData } from '@/shared/types/excel-data.type'
import { File } from '@/modules/files/objects/entities/file.entity'
import { S3Service } from '@/shared/modules/s3/s3.service'
import { BnConfigurationService } from '@/shared/modules/bn-configurations/providers/bn-configuration.service'
import { eBnConfiguration } from '@biblio-num/shared'
import { isArray } from 'class-validator'

@Injectable()
export class XlsxService {
  constructor(
    protected readonly logger: LoggerService,
    private readonly bnConfigService: BnConfigurationService,
    private readonly s3Service: S3Service,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  generateXlsxFileWithMapHeader(
    data: object[],
    mappingHeader: Record<string, string>,
    columns: string[],
  ): ReadStream {
    this.logger.verbose('generateXlsxFileWithMapHeader')
    const newData = data.map((d) =>
      Object.fromEntries(columns.map((c) => [mappingHeader[c], isArray(d[c]) ? d[c].join(', ') : d[c]])),
    )
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

  async readExcelFileFromS3(file: File): Promise<ExcelData> {
    this.logger.verbose('readExcelFileFromS3')
    const stream = await this.s3Service.getCompleteFile(file.uuid)
    return await this.readExcelData(stream)
  }

  async readExcelData(buffer: Buffer): Promise<ExcelData> {
    this.logger.verbose('readExcelData')
    const sheetName = (
      await this.bnConfigService.findByKeyName(
        eBnConfiguration.FE_EXCEL_IMPORT_SHEET_NAME,
      )
    ).stringValue
    const range = (
      await this.bnConfigService.findByKeyName(
        eBnConfiguration.FE_EXCEL_IMPORT_RANGE,
      )
    ).stringValue
    const workbook: XLSX.WorkBook = XLSX.read(buffer, { type: 'buffer' })
    const sheet: XLSX.WorkSheet = workbook.Sheets[sheetName]
    if (!sheet) {
      throw new Error(`Sheet "${sheetName}" not found`)
    }
    const jsonData: ExcelData = XLSX.utils.sheet_to_json(sheet, {
      range,
      header: 1,
    })
    return jsonData.filter((row) => row.length > 0)
  }

  // return the first sheet and the first 1000 of any xlsx file
  returnFirstData(buffer: Buffer): ExcelData {
    const workbook: XLSX.WorkBook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName: string = Object.keys(workbook.Sheets)[0]
    return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName])
  }
}
