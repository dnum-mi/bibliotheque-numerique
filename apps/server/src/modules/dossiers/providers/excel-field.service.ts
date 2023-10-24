import { Injectable } from '@nestjs/common'
import { BaseEntityService } from '@/shared/base-entity/base-entity.service'
import { Field } from '../objects/entities/field.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LoggerService } from '@/shared/modules/logger/logger.service'
import {
  DsChampType,
} from '@/shared/modules/ds-api/objects/ds-champ-type.enum'
import { CreateFieldDto } from '../objects/dto/fields/create-field.dto'
import { FormatFunctionRef, FieldTypeKeys, FieldSource, MappingColumn } from '@biblio-num/shared'
import {
  fixFieldChampsTotalAmount, fixFieldDossierTotalAmount, fixFieldExcelTotalAmount,
  fixFieldsExcelAmount,
  fixFieldsExcelChamp, fixFieldsExcelCharacterFunding, fixFieldsExcelContributorPersonalityType,
  fixFieldsExcelDateFunding, fixFieldsExcelNativeCountry, fixFieldsExcelNatureFunding, fixFieldsExcelPaymentMethod,
} from '@/modules/dossiers/objects/constante/fix-field-excel-champ.dictionnary'
import { ExcelService } from '@/modules/dossiers/providers/excel.service'
import { ConfigService } from '@nestjs/config'
import { RawChamp } from '@/shared/types/raw-champ.type'
import { PieceJustificativeChamp } from '@dnum-mi/ds-api-client'
import { ExcelData, ExcelDataRow } from '@/shared/types/excel-data.type'

@Injectable()
export class ExcelFieldService extends BaseEntityService<Field> {
  constructor(
    @InjectRepository(Field) protected repo: Repository<Field>,
    protected logger: LoggerService,
    private excelService: ExcelService,
    private configService: ConfigService,
  ) {
    super(repo, logger)
    this.logger.setContext(this.constructor.name)
  }

  async proccessByDossierId(id: number): Promise<boolean> {
    this.logger.verbose('proccessByDossierId')

    const excelField: Field = await this.repo.findOne({
      where: {
        dossierId: id,
        fieldSource: 'champs',
        dsChampType: DsChampType.PieceJustificativeChamp,
        sourceId: this.configService.get<string>('excel-import.excelChampId'),
      },
    })

    if (!excelField?.rawJson) {
      this.logger.error('excel field is not correct')
      this.logger.debug(excelField)
      return false
    }

    const fileUrl = (excelField.rawJson as PieceJustificativeChamp).file?.url
    if (!fileUrl) {
      this.logger.warn('Excel field fileUrl not found in rawJson')
      return false
    }

    const rawJson = excelField.rawJson as RawChamp
    const excelFixField = await this.createFieldsFromRawJson(rawJson, id, fileUrl)
    await this.createFieldsAmounts(id, excelFixField)
    return true
  }

  async createFieldsFromRawJson(
    rawJson: RawChamp,
    dossierId: number,
    fileUrl: string,
  ): Promise<Field> {
    this.logger.verbose('createFieldsFromRawJson')

    if (!rawJson) return null
    const field :CreateFieldDto = await this._createFieldsFromExcelFile(
      rawJson,
      dossierId,
      fileUrl,
    )
    if (!field) return null

    this.logger.debug(field)
    return this.repo.save(field)
  }

  private async _createFieldsFromExcelFile(
    champ: RawChamp,
    dossierId: number,
    fileUrl: string,
  ): Promise<CreateFieldDto> {
    this.logger.verbose('_createFieldsFromExcelFile')

    if (champ.id !== this.configService.get<string>('excel-import.excelChampId')) {
      this.logger.verbose('Champ id is not the excel champ id')
      return null
    }

    const excelData: ExcelData = await this.excelService.readExcelFileFromS3(fileUrl)
    if (!excelData.length) {
      this.logger.warn('Excel file is empty')
      return null
    }

    const childrenData = excelData.map((row, i) =>
      this._createFieldsFromExcelRow(row, dossierId, i),
    ).flat()

    return {
      sourceId: fixFieldsExcelChamp.id,
      label: fixFieldsExcelChamp.originalLabel,
      formatFunctionRef: null,
      type: fixFieldsExcelChamp.type,
      fieldSource: fixFieldsExcelChamp.source,
      stringValue: '',
      dateValue: null,
      numberValue: null,
      dsChampType: DsChampType.RepetitionChamp,
      dossierId,
      parentRowIndex: null,
      children: childrenData,
    } as CreateFieldDto
  }

  private _createFieldsFromExcelRow(row: ExcelDataRow, dossierId: number, i: number): CreateFieldDto[] {
    this.logger.verbose('_createFieldsFromExcelRow')
    return [
      this._fixFieldExcelRow(fixFieldsExcelDateFunding, null, dossierId, String(row[0]), new Date(row[0]), null, i),
      this._fixFieldExcelRow(fixFieldsExcelContributorPersonalityType, null, dossierId, String(row[1]), null, null, i),
      this._fixFieldExcelRow(
        fixFieldsExcelNativeCountry, FormatFunctionRef.country, dossierId, String(row[2]), null, null, i,
      ),
      this._fixFieldExcelRow(fixFieldsExcelNatureFunding, null, dossierId, String(row[3]), null, null, i),
      this._fixFieldExcelRow(fixFieldsExcelCharacterFunding, null, dossierId, String(row[4]), null, null, i),
      this._fixFieldExcelRow(fixFieldsExcelPaymentMethod, null, dossierId, String(row[5]), null, null, i),
      this._fixFieldExcelRow(fixFieldsExcelAmount, null, dossierId, String(row[6]), null, Number(row[6]), i),
    ]
  }

  private _fixFieldExcelRow(
    fixFieldMapping: MappingColumn,
    formatFunctionRef: string,
    dossierId: number,
    stringValue: string,
    dateValue: Date | null,
    numberValue: number | null,
    parentRowIndex: number): CreateFieldDto {
    this.logger.verbose('_fixFieldExcelRow')
    return this._fixFieldWithoutChildren(
      fixFieldMapping.id,
      fixFieldMapping.originalLabel,
      formatFunctionRef,
      fixFieldMapping.type,
      fixFieldMapping.source,
      stringValue,
      dateValue,
      numberValue,
      dossierId,
      parentRowIndex,
    )
  }

  async createFieldsAmounts(dossierId: number, excelFixField: Field): Promise<Field[]> {
    this.logger.verbose('createFieldsAmounts')

    const totalAmountFields: number = Number((await this._sumAmountFields(dossierId)).sum)
    const totalAmountExcleFileds: number = this._sumAmountExcelFields(excelFixField)

    const fields :CreateFieldDto[] = await this._createFieldsTotalAmount(
      dossierId,
      totalAmountFields,
      totalAmountExcleFileds,
    )
    if (!fields) return null

    this.logger.debug(fields)
    return this.repo.save(fields)
  }

  async _sumAmountFields(dossierId: number): Promise<{ sum: number }> {
    this.logger.verbose('_sumAmountFields')
    return await this.repo
      .createQueryBuilder('field')
      .select('SUM(field.numberValue)', 'sum')
      .where('field.dossierId = :dossierId', { dossierId })
      .andWhere('field.fieldSource = :fieldSource', { fieldSource: FieldSource.champs })
      .andWhere('field.dsChampType = :dsChampType', { dsChampType: DsChampType.IntegerNumberChamp })
      .andWhere('field.sourceId = :sourceId',
        { sourceId: this.configService.get<string>('excel-import.amountChampId') })
      .andWhere('field.numberValue IS NOT NULL')
      .getRawOne()
  }

  private _sumAmountExcelFields(excelFixField: Field): number {
    this.logger.verbose('_sumAmountExcelFields')

    if (!excelFixField?.children?.length) return 0
    return excelFixField.children.reduce((acc, curr) => {
      if (curr.sourceId === fixFieldsExcelAmount.id) {
        return acc + curr.numberValue
      } else {
        return acc
      }
    }, 0)
  }

  private async _createFieldsTotalAmount(
    dossierId: number,
    totalAmountFields: number,
    totalAmountExcleFileds: number,
  ): Promise<CreateFieldDto[]> {
    this.logger.verbose('_createFieldsTotalAmount')
    return [
      this._fixFieldTotalAmount(fixFieldDossierTotalAmount, dossierId, totalAmountFields + totalAmountExcleFileds),
      this._fixFieldTotalAmount(fixFieldChampsTotalAmount, dossierId, totalAmountFields),
      this._fixFieldTotalAmount(fixFieldExcelTotalAmount, dossierId, totalAmountExcleFileds),
    ]
  }

  private _fixFieldTotalAmount(fixFieldMapping: MappingColumn, dossierId: number, amount: number): CreateFieldDto {
    this.logger.verbose('_fixFieldTotalAmount')
    return this._fixFieldWithoutChildren(
      fixFieldMapping.id,
      fixFieldMapping.originalLabel,
      null,
      fixFieldMapping.type,
      fixFieldMapping.source,
      amount.toString(),
      null,
      Number(amount),
      dossierId,
      null,
    )
  }

  private _fixFieldWithoutChildren(
    sourceId: string,
    label: string,
    formatFunctionRef: string,
    type: FieldTypeKeys,
    fieldSource: string,
    stringValue: string,
    dateValue: Date | null,
    numberValue: number | null,
    dossierId: number,
    parentRowIndex: number,
  ): CreateFieldDto {
    this.logger.verbose('_fixFieldWithoutChildren')
    return {
      sourceId,
      label,
      formatFunctionRef,
      type,
      fieldSource,
      stringValue,
      dateValue,
      numberValue,
      dsChampType: null,
      dossierId,
      parentRowIndex,
      children: null,
      rawJson: null,
    }
  }
}
