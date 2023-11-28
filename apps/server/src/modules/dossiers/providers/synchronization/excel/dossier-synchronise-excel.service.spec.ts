import { Test, TestingModule } from '@nestjs/testing'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../../../../../test/mock/logger-service.mock'
import { FormatFunctionRef } from '@biblio-num/shared'
import {
  fixFieldChampsTotalAmount,
  fixFieldDossierTotalAmount, fixFieldExcelTotalAmount,
  fixFieldsExcelAmount, fixFieldsExcelChamp,
  fixFieldsExcelCharacterFunding,
  fixFieldsExcelContributorPersonalityType,
  fixFieldsExcelDateFunding, fixFieldsExcelNativeCountry, fixFieldsExcelNatureFunding, fixFieldsExcelPaymentMethod,
} from '@/modules/dossiers/objects/constante/fix-field-excel-champ.dictionnary'
import { excelChampsLabel } from '@/modules/dossiers/objects/constante/excel-champ.enum'
import { DsChampType } from '@/shared/modules/ds-api/objects/ds-champ-type.enum'
import excelImportConfig from '@/config/excel-import.config'
import { ConfigModule } from '@nestjs/config'
import {
  DossierSynchroniseExcelService,
} from '@/modules/dossiers/providers/synchronization/excel/dossier-synchronise-excel.service'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'
import { ExcelDataRow } from '@/shared/types/excel-data.type'
import { XlsxService } from '@/shared/modules/xlsx/xlsx.service'

const fakeExcelDateFundingNumber = 45288
const fakeExcelDateFundingString = '28/12/2023'
const fakeExcelContributorPersonalityType = 'PM'
const fakeExcelNativeContry = 'AUTRICHE'
const fakeExcelNatureFunding = 'RP'
const fakeExcelCharacterFunding = 'D'
const fakeExcelPaymentMethod = 'CB'
const fakeExcelAmount = 1000

const fakeChampTotalAmount = 9800
const fakeExcelTotalAmount = fakeExcelAmount * 2
const fakeDossierTotalAmount = fakeChampTotalAmount + fakeExcelTotalAmount

const fakeExcelData = [
  [
    fakeExcelDateFundingNumber,
    fakeExcelContributorPersonalityType,
    fakeExcelNativeContry,
    fakeExcelNatureFunding,
    fakeExcelCharacterFunding,
    fakeExcelPaymentMethod,
    fakeExcelAmount,
  ],
  [
    fakeExcelDateFundingNumber,
    fakeExcelContributorPersonalityType,
    fakeExcelNativeContry,
    fakeExcelNatureFunding,
    fakeExcelCharacterFunding,
    fakeExcelPaymentMethod,
    fakeExcelAmount,
  ],
]

const expectedExcelFixFieldsChildren1 = [
  {
    sourceId: fixFieldsExcelDateFunding.id,
    label: excelChampsLabel.dateFunding,
    formatFunctionRef: null,
    type: 'date',
    fieldSource: fixFieldsExcelDateFunding.source,
    stringValue: fakeExcelDateFundingString,
    dateValue: new Date((fakeExcelDateFundingNumber - 25569) * 86400 * 1000),
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 0,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelContributorPersonalityType.id,
    label: excelChampsLabel.contributorPersonalityType,
    formatFunctionRef: null,
    type: 'string',
    fieldSource: fixFieldsExcelContributorPersonalityType.source,
    stringValue: fakeExcelContributorPersonalityType,
    dateValue: null,
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 0,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelNativeCountry.id,
    label: excelChampsLabel.nativeCountry,
    formatFunctionRef: FormatFunctionRef.country,
    type: 'string',
    fieldSource: fixFieldsExcelNativeCountry.source,
    stringValue: fakeExcelNativeContry,
    dateValue: null,
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 0,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelNatureFunding.id,
    label: excelChampsLabel.natureFunding,
    formatFunctionRef: null,
    type: 'string',
    fieldSource: fixFieldsExcelNatureFunding.source,
    stringValue: fakeExcelNatureFunding,
    dateValue: null,
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 0,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelCharacterFunding.id,
    label: excelChampsLabel.characterFunding,
    formatFunctionRef: null,
    type: 'string',
    fieldSource: fixFieldsExcelCharacterFunding.source,
    stringValue: fakeExcelCharacterFunding,
    dateValue: null,
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 0,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelPaymentMethod.id,
    label: excelChampsLabel.paymentMethod,
    formatFunctionRef: null,
    type: 'string',
    fieldSource: fixFieldsExcelPaymentMethod.source,
    stringValue: fakeExcelPaymentMethod,
    dateValue: null,
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 0,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelAmount.id,
    label: excelChampsLabel.amount,
    formatFunctionRef: null,
    type: 'number',
    fieldSource: fixFieldsExcelAmount.source,
    stringValue: fakeExcelAmount.toString(),
    dateValue: null,
    numberValue: fakeExcelAmount,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 0,
    children: null,
    rawJson: null,
  },
]

const expectedExcelFixFieldsChildren2 = [
  {
    sourceId: fixFieldsExcelDateFunding.id,
    label: excelChampsLabel.dateFunding,
    formatFunctionRef: null,
    type: 'date',
    fieldSource: fixFieldsExcelDateFunding.source,
    stringValue: fakeExcelDateFundingString,
    dateValue: new Date((fakeExcelDateFundingNumber - 25569) * 86400 * 1000),
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 1,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelContributorPersonalityType.id,
    label: excelChampsLabel.contributorPersonalityType,
    formatFunctionRef: null,
    type: 'string',
    fieldSource: fixFieldsExcelContributorPersonalityType.source,
    stringValue: fakeExcelContributorPersonalityType,
    dateValue: null,
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 1,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelNativeCountry.id,
    label: excelChampsLabel.nativeCountry,
    formatFunctionRef: FormatFunctionRef.country,
    type: 'string',
    fieldSource: fixFieldsExcelNativeCountry.source,
    stringValue: fakeExcelNativeContry,
    dateValue: null,
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 1,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelNatureFunding.id,
    label: excelChampsLabel.natureFunding,
    formatFunctionRef: null,
    type: 'string',
    fieldSource: fixFieldsExcelNatureFunding.source,
    stringValue: fakeExcelNatureFunding,
    dateValue: null,
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 1,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelCharacterFunding.id,
    label: excelChampsLabel.characterFunding,
    formatFunctionRef: null,
    type: 'string',
    fieldSource: fixFieldsExcelCharacterFunding.source,
    stringValue: fakeExcelCharacterFunding,
    dateValue: null,
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 1,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelPaymentMethod.id,
    label: excelChampsLabel.paymentMethod,
    formatFunctionRef: null,
    type: 'string',
    fieldSource: fixFieldsExcelPaymentMethod.source,
    stringValue: fakeExcelPaymentMethod,
    dateValue: null,
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 1,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelAmount.id,
    label: excelChampsLabel.amount,
    formatFunctionRef: null,
    type: 'number',
    fieldSource: fixFieldsExcelAmount.source,
    stringValue: fakeExcelAmount.toString(),
    dateValue: null,
    numberValue: fakeExcelAmount,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 1,
    children: null,
    rawJson: null,
  },
]

const expectedExcelFixFieldsDates = {
  sourceId: fixFieldsExcelChamp.id,
  label: excelChampsLabel.excelPieceJointe,
  formatFunctionRef: null,
  type: 'string',
  fieldSource: fixFieldsExcelChamp.source,
  stringValue: '',
  dateValue: null,
  numberValue: null,
  dsChampType: DsChampType.RepetitionChamp,
  dossierId: 42,
  parentRowIndex: null,
  children: [
    ...expectedExcelFixFieldsChildren1,
    ...expectedExcelFixFieldsChildren2,
  ],
}

const expectedExcelFixFieldsChildrenWithError = [
  {
    sourceId: fixFieldsExcelDateFunding.id,
    label: excelChampsLabel.dateFunding,
    formatFunctionRef: null,
    type: 'date',
    fieldSource: fixFieldsExcelDateFunding.source,
    stringValue: 'null',
    dateValue: null,
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 0,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelContributorPersonalityType.id,
    label: excelChampsLabel.contributorPersonalityType,
    formatFunctionRef: null,
    type: 'string',
    fieldSource: fixFieldsExcelContributorPersonalityType.source,
    stringValue: 'null',
    dateValue: null,
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 0,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelNativeCountry.id,
    label: excelChampsLabel.nativeCountry,
    formatFunctionRef: FormatFunctionRef.country,
    type: 'string',
    fieldSource: fixFieldsExcelNativeCountry.source,
    stringValue: 'null',
    dateValue: null,
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 0,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelNatureFunding.id,
    label: excelChampsLabel.natureFunding,
    formatFunctionRef: null,
    type: 'string',
    fieldSource: fixFieldsExcelNatureFunding.source,
    stringValue: 'null',
    dateValue: null,
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 0,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelCharacterFunding.id,
    label: excelChampsLabel.characterFunding,
    formatFunctionRef: null,
    type: 'string',
    fieldSource: fixFieldsExcelCharacterFunding.source,
    stringValue: 'null',
    dateValue: null,
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 0,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelPaymentMethod.id,
    label: excelChampsLabel.paymentMethod,
    formatFunctionRef: null,
    type: 'string',
    fieldSource: fixFieldsExcelPaymentMethod.source,
    stringValue: 'null',
    dateValue: null,
    numberValue: null,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 0,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldsExcelAmount.id,
    label: excelChampsLabel.amount,
    formatFunctionRef: null,
    type: 'number',
    fieldSource: fixFieldsExcelAmount.source,
    stringValue: 'null',
    dateValue: null,
    numberValue: NaN,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: 0,
    children: null,
    rawJson: null,
  },
]

const expectedAmountFixFieldsDates = [
  {
    sourceId: fixFieldDossierTotalAmount.id,
    label: fixFieldDossierTotalAmount.originalLabel,
    formatFunctionRef: null,
    type: fixFieldDossierTotalAmount.type,
    fieldSource: fixFieldDossierTotalAmount.source,
    stringValue: fakeDossierTotalAmount.toString(),
    dateValue: null,
    numberValue: fakeDossierTotalAmount,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: null,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldChampsTotalAmount.id,
    label: fixFieldChampsTotalAmount.originalLabel,
    formatFunctionRef: null,
    type: fixFieldChampsTotalAmount.type,
    fieldSource: fixFieldChampsTotalAmount.source,
    stringValue: fakeChampTotalAmount.toString(),
    dateValue: null,
    numberValue: fakeChampTotalAmount,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: null,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldExcelTotalAmount.id,
    label: fixFieldExcelTotalAmount.originalLabel,
    formatFunctionRef: null,
    type: fixFieldExcelTotalAmount.type,
    fieldSource: fixFieldExcelTotalAmount.source,
    stringValue: fakeExcelTotalAmount.toString(),
    dateValue: null,
    numberValue: fakeExcelTotalAmount,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: null,
    children: null,
    rawJson: null,
  },
]

const expectedAmountWithoutExcelFixFieldsDates = [
  {
    sourceId: fixFieldDossierTotalAmount.id,
    label: fixFieldDossierTotalAmount.originalLabel,
    formatFunctionRef: null,
    type: fixFieldDossierTotalAmount.type,
    fieldSource: fixFieldDossierTotalAmount.source,
    stringValue: fakeChampTotalAmount.toString(),
    dateValue: null,
    numberValue: fakeChampTotalAmount,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: null,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldChampsTotalAmount.id,
    label: fixFieldChampsTotalAmount.originalLabel,
    formatFunctionRef: null,
    type: fixFieldChampsTotalAmount.type,
    fieldSource: fixFieldChampsTotalAmount.source,
    stringValue: fakeChampTotalAmount.toString(),
    dateValue: null,
    numberValue: fakeChampTotalAmount,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: null,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldExcelTotalAmount.id,
    label: fixFieldExcelTotalAmount.originalLabel,
    formatFunctionRef: null,
    type: fixFieldExcelTotalAmount.type,
    fieldSource: fixFieldExcelTotalAmount.source,
    stringValue: '0',
    dateValue: null,
    numberValue: 0,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: null,
    children: null,
    rawJson: null,
  },
]

const expectedAmountWithoutChampsFixFieldsDates = [
  {
    sourceId: fixFieldDossierTotalAmount.id,
    label: fixFieldDossierTotalAmount.originalLabel,
    formatFunctionRef: null,
    type: fixFieldDossierTotalAmount.type,
    fieldSource: fixFieldDossierTotalAmount.source,
    stringValue: fakeExcelTotalAmount.toString(),
    dateValue: null,
    numberValue: fakeExcelTotalAmount,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: null,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldChampsTotalAmount.id,
    label: fixFieldChampsTotalAmount.originalLabel,
    formatFunctionRef: null,
    type: fixFieldChampsTotalAmount.type,
    fieldSource: fixFieldChampsTotalAmount.source,
    stringValue: '0',
    dateValue: null,
    numberValue: 0,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: null,
    children: null,
    rawJson: null,
  },
  {
    sourceId: fixFieldExcelTotalAmount.id,
    label: fixFieldExcelTotalAmount.originalLabel,
    formatFunctionRef: null,
    type: fixFieldExcelTotalAmount.type,
    fieldSource: fixFieldExcelTotalAmount.source,
    stringValue: fakeExcelTotalAmount.toString(),
    dateValue: null,
    numberValue: fakeExcelTotalAmount,
    dsChampType: null,
    dossierId: 42,
    parentRowIndex: null,
    children: null,
    rawJson: null,
  },
]

describe('DossierSyncroniseExcel', () => {
  let service: DossierSynchroniseExcelService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          cache: true,
          load: [excelImportConfig],
        }),
      ],
      controllers: [],
      providers: [DossierSynchroniseExcelService],
    })
      .useMocker((token) => {
        if (token === 'FieldRepository') {
          return {
            save: jest.fn().mockImplementation((a) => a),
          }
        } else if (token === LoggerService) {
          return loggerServiceMock
        } else if (token === XlsxService) {
          return {
            readExcelFileFromS3: jest.fn().mockResolvedValue(fakeExcelData),
          }
        }
      })
      .compile()

    service = module.get<DossierSynchroniseExcelService>(DossierSynchroniseExcelService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('Should get null if excel field not found', async () => {
    const raw = {}
    jest.spyOn(service, '_findExcelFieldByDossierId').mockResolvedValue({ rawJson: raw } as unknown as Field)
    const result = await service.createFieldsFromRawJson(42)
    expect(result).toBeNull()
  })

  it('Should create children scenario for excel champs: format DateFunding with error', async () => {
    const row: ExcelDataRow = [
      '11-11-2022',
      fakeExcelContributorPersonalityType,
      fakeExcelNativeContry,
      fakeExcelNatureFunding,
      fakeExcelCharacterFunding,
      fakeExcelPaymentMethod,
      fakeExcelAmount,
    ] as ExcelDataRow
    const fields = await service._createFieldsFromExcelRow(row, 42, 0)
    expect(fields).toContainEqual(
      expectedExcelFixFieldsChildrenWithError[0],
    )
  })

  it('should create scenario for excel champs: format ContributorPersonalityType with error', () => {
    const row: ExcelDataRow = [
      fakeExcelDateFundingNumber,
      '',
      fakeExcelNativeContry,
      fakeExcelNatureFunding,
      fakeExcelCharacterFunding,
      fakeExcelPaymentMethod,
      fakeExcelAmount,
    ] as ExcelDataRow
    const fields = service._createFieldsFromExcelRow(row, 42, 0)
    expect(fields).toContainEqual(
      expectedExcelFixFieldsChildrenWithError[1],
    )
  })

  it('should create scenario for excel champs: formate NativeContry with error', () => {
    const row: ExcelDataRow = [
      fakeExcelDateFundingNumber,
      fakeExcelContributorPersonalityType,
      'France',
      'bad nature funding',
      'bad character funding',
      'bad payment method',
      fakeExcelAmount,
    ] as ExcelDataRow
    const fields = service._createFieldsFromExcelRow(row, 42, 0)
    expect(fields).toContainEqual(
      expectedExcelFixFieldsChildrenWithError[2],
    )
    expect(fields).toContainEqual(
      expectedExcelFixFieldsChildrenWithError[3],
    )
    expect(fields).toContainEqual(
      expectedExcelFixFieldsChildrenWithError[4],
    )
    expect(fields).toContainEqual(
      expectedExcelFixFieldsChildrenWithError[5],
    )
  })

  it('should create scenario for excel champs: Amount > 15300', () => {
    const row: ExcelDataRow = [
      fakeExcelDateFundingNumber,
      fakeExcelContributorPersonalityType,
      fakeExcelNativeContry,
      fakeExcelNatureFunding,
      fakeExcelCharacterFunding,
      fakeExcelPaymentMethod,
      15301,
    ] as ExcelDataRow
    const fields = service._createFieldsFromExcelRow(row, 42, 0)
    expect(fields).toContainEqual(
      {
        sourceId: fixFieldsExcelAmount.id,
        label: excelChampsLabel.amount,
        formatFunctionRef: null,
        type: 'number',
        fieldSource: fixFieldsExcelAmount.source,
        stringValue: '0',
        dateValue: null,
        numberValue: 0,
        dsChampType: null,
        dossierId: 42,
        parentRowIndex: 0,
        children: null,
        rawJson: null,
      },
    )
  })

  it('should create scenario for excel champs: Amount < 0', () => {
    const row: ExcelDataRow = [
      fakeExcelDateFundingNumber,
      fakeExcelContributorPersonalityType,
      fakeExcelNativeContry,
      fakeExcelNatureFunding,
      fakeExcelCharacterFunding,
      fakeExcelPaymentMethod,
      -1,
    ] as ExcelDataRow
    const fields = service._createFieldsFromExcelRow(row, 42, 0)
    expect(fields).toContainEqual(
      {
        sourceId: fixFieldsExcelAmount.id,
        label: excelChampsLabel.amount,
        formatFunctionRef: null,
        type: 'number',
        fieldSource: fixFieldsExcelAmount.source,
        stringValue: '0',
        dateValue: null,
        numberValue: 0,
        dsChampType: null,
        dossierId: 42,
        parentRowIndex: 0,
        children: null,
        rawJson: null,
      },
    )
  })

  it('should create scenario for excel champs: Amount is a string', () => {
    const row: ExcelDataRow = [
      fakeExcelDateFundingNumber,
      fakeExcelContributorPersonalityType,
      fakeExcelNativeContry,
      fakeExcelNatureFunding,
      fakeExcelCharacterFunding,
      fakeExcelPaymentMethod,
      'bad amount',
    ] as ExcelDataRow
    const fields = service._createFieldsFromExcelRow(row, 42, 0)
    expect(fields).toContainEqual(
      {
        sourceId: fixFieldsExcelAmount.id,
        label: excelChampsLabel.amount,
        formatFunctionRef: null,
        type: 'number',
        fieldSource: fixFieldsExcelAmount.source,
        stringValue: '0',
        dateValue: null,
        numberValue: 0,
        dsChampType: null,
        dossierId: 42,
        parentRowIndex: 0,
        children: null,
        rawJson: null,
      },
    )
  })

  it('Should create children scenario for excel champs', async () => {
    const raw = {
      id: 'Q2hhbXAtNTg=',
      __typename: 'PieceJustificativeChamp',
      label: 'Bien vouloir joindre un document listant les financements mises à disposition',
      stringValue: '',
      file: {
        filename: 'DeclarationFinancementsEtrangers.xlsx',
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        checksum: 'nsscvfACf5r/WfqcvX9iUQ==',
        byteSizeBigInt: '149557',
        url: 'test/mock/excel-service/data/DeclarationFinancementsEtrangers.xlsx',
      },
    }
    jest.spyOn(service, '_findExcelFieldByDossierId').mockResolvedValue({ rawJson: raw } as unknown as Field)
    const fields = await service.createFieldsFromRawJson(42)
    expect(fields).toMatchObject(
      expectedExcelFixFieldsDates,
    )
  })

  it('Should create total amount fields', async () => {
    jest.spyOn(service, '_sumAmountFields').mockResolvedValue({ sum: fakeChampTotalAmount })
    const fields = await service.createFieldsAmounts(42, expectedExcelFixFieldsDates as unknown as Field)
    expect(fields).toMatchObject(
      expectedAmountFixFieldsDates,
    )
  })

  it('Should create total amount without excel fields', async () => {
    jest.spyOn(service, '_sumAmountFields').mockResolvedValue({ sum: fakeChampTotalAmount })
    const result = await service.createFieldsAmounts(42, null)
    expect(result).toMatchObject(
      expectedAmountWithoutExcelFixFieldsDates,
    )
  })

  it('Should create total amount without champs fields', async () => {
    jest.spyOn(service, '_sumAmountFields').mockResolvedValue({ sum: 0 })
    const result = await service.createFieldsAmounts(42, expectedExcelFixFieldsDates as unknown as Field)
    expect(result).toMatchObject(
      expectedAmountWithoutChampsFixFieldsDates,
    )
  })

  it('Should get good format date', async () => {
    const result = await service._formatCellDate(fakeExcelDateFundingNumber)
    expect(result).toEqual(
      fakeExcelDateFundingString,
    )
  })

  it('Should get good Date by String', async () => {
    const result = await service._getDateByString('28/12/2023')
    expect(result).toEqual(
      new Date('2023-12-28'),
    )
  })
})
