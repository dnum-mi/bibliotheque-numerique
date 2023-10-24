import {
  FieldType,
  MappingColumn,
  FieldSource, FormatFunctionRef,
} from '@biblio-num/shared'
import { excelChampsLabel, totalAmountLable } from '@/modules/dossiers/objects/constante/excel-champ.enum'

export const fixFieldsExcelChamp: MappingColumn = {
  id: '9863ce70-6378-4d7e-aca9-b81fb7b97b20',
  columnLabel: null,
  originalLabel: excelChampsLabel.excelPieceJointe,
  type: FieldType.string,
  source: FieldSource.fixField,
}

export const fixFieldsExcelDateFunding: MappingColumn = {
  id: '9863ce70-6378-4d7e-aca9-b81fb7b97c20',
  columnLabel: null,
  originalLabel: excelChampsLabel.dateFunding,
  type: FieldType.date,
  source: FieldSource.fixField,
}

export const fixFieldsExcelContributorPersonalityType: MappingColumn = {
  id: '9863ce70-6378-4d7e-aca9-b81fb7b97c21',
  columnLabel: null,
  originalLabel: excelChampsLabel.contributorPersonalityType,
  type: FieldType.string,
  source: FieldSource.fixField,
}

export const fixFieldsExcelNativeCountry: MappingColumn = {
  id: '9863ce70-6378-4d7e-aca9-b81fb7b97c22',
  columnLabel: null,
  originalLabel: excelChampsLabel.nativeCountry,
  formatFunctionRef: FormatFunctionRef.country,
  type: FieldType.string,
  source: FieldSource.fixField,
}

export const fixFieldsExcelNatureFunding: MappingColumn = {
  id: '9863ce70-6378-4d7e-aca9-b81fb7b97c23',
  columnLabel: null,
  originalLabel: excelChampsLabel.natureFunding,
  type: FieldType.string,
  source: FieldSource.fixField,
}

export const fixFieldsExcelCharacterFunding: MappingColumn = {
  id: '9863ce70-6378-4d7e-aca9-b81fb7b97c24',
  columnLabel: null,
  originalLabel: excelChampsLabel.characterFunding,
  type: FieldType.string,
  source: FieldSource.fixField,
}

export const fixFieldsExcelPaymentMethod: MappingColumn = {
  id: '9863ce70-6378-4d7e-aca9-b81fb7b97c25',
  columnLabel: null,
  originalLabel: excelChampsLabel.paymentMethod,
  type: FieldType.string,
  source: FieldSource.fixField,
}

export const fixFieldsExcelAmount: MappingColumn = {
  id: '9863ce70-6378-4d7e-aca9-b81fb7b97c26',
  columnLabel: null,
  originalLabel: excelChampsLabel.amount,
  type: FieldType.number,
  source: FieldSource.fixField,
}

export const fixFieldsExcelChamps: MappingColumn = {
  ...fixFieldsExcelChamp,
  children: [
    fixFieldsExcelDateFunding,
    fixFieldsExcelContributorPersonalityType,
    fixFieldsExcelNativeCountry,
    fixFieldsExcelNatureFunding,
    fixFieldsExcelCharacterFunding,
    fixFieldsExcelPaymentMethod,
    fixFieldsExcelAmount,
  ],
}

export const fixFieldDossierTotalAmount: MappingColumn = {
  id: '9863ce70-6378-4d7e-aca9-b81fb7b97c30',
  columnLabel: null,
  originalLabel: totalAmountLable.totalAmountDossier,
  type: FieldType.number,
  source: FieldSource.fixField,
}

export const fixFieldChampsTotalAmount: MappingColumn = {
  id: '9863ce70-6378-4d7e-aca9-b81fb7b97c31',
  columnLabel: null,
  originalLabel: totalAmountLable.totalAmountChamps,
  type: FieldType.number,
  source: FieldSource.fixField,
}

export const fixFieldExcelTotalAmount: MappingColumn = {
  id: '9863ce70-6378-4d7e-aca9-b81fb7b97c32',
  columnLabel: null,
  originalLabel: totalAmountLable.totalAmountExcel,
  type: FieldType.number,
  source: FieldSource.fixField,
}

export const fixFieldsAmounts: MappingColumn[] = [
  fixFieldDossierTotalAmount,
  fixFieldChampsTotalAmount,
  fixFieldExcelTotalAmount,
]
