import { registerAs } from '@nestjs/config'

export default registerAs('excel-import', () => ({
  sheetName: process.env.EXCEL_IMPORT_SHEET_NAME || 'Déclaration des FE',
  range: process.env.EXCEL_IMPORT_RANGE || 'B4:H502',
  excelChampId: process.env.EXCEL_IMPORT_CHAMP_ID || 'Q2hhbXAtNTg=',
  amountChampId: process.env.EXCEL_IMPORT_AMOUNT_CHAMP_ID || 'Q2hhbXAtMTA1MA==',
}))
