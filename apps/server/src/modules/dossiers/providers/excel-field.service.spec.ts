import { Test, TestingModule } from '@nestjs/testing'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import { loggerServiceMock } from '../../../../test/mock/logger-service.mock'
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
import { ExcelService } from '@/modules/dossiers/providers/excel.service'
import excelImportConfig from '@/config/excel-import.config'
import { ConfigModule } from '@nestjs/config'
import { ExcelFieldService } from '@/modules/dossiers/providers/excel-field.service'
import { RawChamp } from '@/shared/types/raw-champ.type'
import { Field } from '@/modules/dossiers/objects/entities/field.entity'

const fakeExcelDateFunding = '11/11/2022'
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
    fakeExcelDateFunding,
    fakeExcelContributorPersonalityType,
    fakeExcelNativeContry,
    fakeExcelNatureFunding,
    fakeExcelCharacterFunding,
    fakeExcelPaymentMethod,
    fakeExcelAmount,
  ],
  [
    fakeExcelDateFunding,
    fakeExcelContributorPersonalityType,
    fakeExcelNativeContry,
    fakeExcelNatureFunding,
    fakeExcelCharacterFunding,
    fakeExcelPaymentMethod,
    fakeExcelAmount,
  ],
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
    {
      sourceId: fixFieldsExcelDateFunding.id,
      label: excelChampsLabel.dateFunding,
      formatFunctionRef: null,
      type: 'date',
      fieldSource: fixFieldsExcelDateFunding.source,
      stringValue: fakeExcelDateFunding,
      dateValue: new Date(fakeExcelDateFunding),
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
    {
      sourceId: fixFieldsExcelDateFunding.id,
      label: excelChampsLabel.dateFunding,
      formatFunctionRef: null,
      type: 'date',
      fieldSource: fixFieldsExcelDateFunding.source,
      stringValue: fakeExcelDateFunding,
      dateValue: new Date(fakeExcelDateFunding),
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
  ],
}

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

describe('ExcelFieldService', () => {
  let service: ExcelFieldService

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
      providers: [ExcelFieldService],
    })
      .useMocker((token) => {
        if (token === 'FieldRepository') {
          return {
            save: jest.fn().mockImplementation((a) => a),
          }
        } else if (token === LoggerService) {
          return loggerServiceMock
        } else if (token === ExcelService) {
          return {
            readExcelFileFromS3: jest.fn().mockResolvedValue(fakeExcelData),
          }
        }
      })
      .compile()

    service = module.get<ExcelFieldService>(ExcelFieldService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('Should get null if excel field not found', async () => {
    const result = await service.createFieldsFromRawJson(null, 42, 'path/DeclarationFinancementsEtrangers.xlsx')
    expect(result).toBeNull()
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
    } as unknown as RawChamp
    const fields = await service.createFieldsFromRawJson(raw, 42, 'path/DeclarationFinancementsEtrangers.xlsx')
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
})
