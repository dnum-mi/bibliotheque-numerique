import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import * as PDFDocument from 'pdfkit'
import { IPdfGenerator } from './interfaces/pdf-generator.interface'
import { Readable } from 'stream'

@Injectable()
export class PdfExportService {
  constructor(
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name)
  }

  async createPdf<T>(generator: IPdfGenerator<T>, data: T): Promise<Readable> {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })

    generator(doc, data)
      .then(() => {
        doc.end()
      })
      .catch((err) => {
        doc.emit('error', new InternalServerErrorException(err))
      })

    return doc as unknown as Readable
  }
}
