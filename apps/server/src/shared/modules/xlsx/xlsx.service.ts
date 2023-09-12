import { Injectable } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import * as XLSX from 'xlsx'
import { join } from 'path'
import { v4 } from 'uuid'
import { createReadStream, promises as fsPromises, type ReadStream } from 'fs'

@Injectable()
export class XlsxService {
  constructor(private readonly logger: LoggerService) {
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
}
