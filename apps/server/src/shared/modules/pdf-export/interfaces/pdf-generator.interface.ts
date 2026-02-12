import * as PDFDocument from 'pdfkit'

export interface IPdfGenerator<T = unknown> {
  (doc: typeof PDFDocument, data: T): Promise<void>;
}
