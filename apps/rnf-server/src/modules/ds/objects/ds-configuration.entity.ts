import { DSConfiguration } from '@prisma/client'
import { BaseEntity } from '@/shared/base-entity/base.entity'
import { IsDate, IsDefined, IsNumber, IsOptional, IsString } from 'class-validator'

export class DsConfigurationEntity
  extends BaseEntity
  implements DSConfiguration {
  @IsDate()
  foundationRefreshedAt: Date

  @IsNumber()
  @IsDefined()
  dsDemarcheFDDCreationId: number

  @IsString()
  @IsDefined()
  dsDemarcheFDDCreationAnnotationId: string

  @IsNumber()
  @IsDefined()
  dsDemarcheFDDModificationId: number

  @IsNumber()
  @IsDefined()
  dsDemarcheFDDDissolutionId: number

  @IsNumber()
  @IsDefined()
  dsDemarcheFECreationId: number

  @IsString()
  @IsDefined()
  dsDemarcheFECreationAnnotationId: string

  @IsNumber()
  @IsDefined()
  dsDemarcheFEModificationId: number

  @IsNumber()
  @IsNumber()
  @IsDefined()
  dsDemarcheFEDissolutionId: number

  @IsNumber()
  @IsDefined()
  dsDemarcheDNRId: number

  @IsString()
  @IsDefined()
  dsDemarcheDNRAnnotationId: string

  @IsString()
  @IsDefined()
  fieldRegexTitle: string

  @IsString()
  @IsDefined()
  fieldRegexType: string

  @IsString()
  @IsDefined()
  fieldRegexAddress: string

  @IsString()
  @IsDefined()
  fieldRegexEmail: string

  @IsString()
  @IsDefined()
  fieldRegexPhone: string

  @IsString()
  @IsDefined()
  fieldRegexPerson: string

  @IsString()
  @IsDefined()
  fieldRegexRnfId: string

  @IsString()
  @IsDefined()
  fieldRegexStatus: string

  @IsString()
  @IsDefined()
  cronUpdateFrequency: string

  @IsString()
  @IsDefined()
  fieldRegexPersonQuality: string

  @IsString()
  @IsDefined()
  fieldRegexPersonCivility: string

  @IsString()
  @IsDefined()
  fieldRegexPersonFirstName: string

  @IsString()
  @IsDefined()
  fieldRegexPersonLastName: string

  @IsString()
  @IsDefined()
  fieldRegexPersonBornAt: string

  @IsString()
  @IsDefined()
  fieldRegexPersonBornPlace: string

  @IsString()
  @IsDefined()
  fieldRegexPersonNationality: string

  @IsString()
  @IsDefined()
  fieldRegexPersonProfession: string

  @IsString()
  @IsDefined()
  fieldRegexPersonAddress: string

  @IsString()
  @IsDefined()
  fieldRegexPersonPhone: string

  @IsString()
  @IsDefined()
  fieldRegexPersonIsFounder: string

  @IsString()
  @IsDefined()
  fieldRegexPersonRole: string

  @IsString()
  @IsDefined()
  fieldRegexAdministator: string

  @IsString()
  @IsDefined()
  fieldRegexFiscalEndDate: string

  @IsString()
  @IsDefined()
  fieldRegexDeclarationYears: string

  @IsNumber()
  @IsDefined()
  dsDemarcheFDDAdministrationChangesId: number

  @IsNumber()
  @IsDefined()
  dsDemarcheFEAdministrationChangesId: number

  @IsOptional()
  @IsDate()
  fieldRegexCreatedAt: string

  @IsString()
  @IsDefined()
  fieldRegexDepartment: string
}
