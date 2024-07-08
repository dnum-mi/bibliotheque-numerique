import { IsNumber, IsOptional, IsString } from 'class-validator'

// TODO: Why is PartialType not working ??
// export class UpdateDsConfigurationInputDto extends PartialType(DsConfigurationEntity) {}

export class UpdateDsConfigurationInputDto {
  @IsNumber()
  @IsOptional()
  dsDemarcheFDDCreationId: number

  @IsString()
  @IsOptional()
  dsDemarcheFDDCreationAnnotationId: string

  @IsNumber()
  @IsOptional()
  dsDemarcheFDDModificationId: number

  @IsNumber()
  @IsOptional()
  dsDemarcheFDDDissolutionId: number

  @IsNumber()
  @IsOptional()
  dsDemarcheFECreationId: number

  @IsString()
  @IsOptional()
  dsDemarcheFECreationAnnotationId: string

  @IsNumber()
  @IsOptional()
  dsDemarcheFEModificationId: number

  @IsNumber()
  @IsOptional()
  dsDemarcheFEDissolutionId: number

  @IsNumber()
  @IsOptional()
  dsDemarcheDNRId: number

  @IsString()
  @IsOptional()
  dsDemarcheDNRAnnotationId: string

  //#region FRUP
  @IsNumber()
  @IsOptional()
  dsDemarcheFRUPCreationId: number

  @IsString()
  @IsOptional()
  dsDemarcheFRUPCreationAnnotationId: string

  @IsNumber()
  @IsOptional()
  dsDemarcheFRUPModificationId: number

  @IsNumber()
  @IsOptional()
  dsDemarcheFRUPDissolutionId: number
  //#endregion FRUP

  //#region regex code champs
  @IsString()
  @IsOptional()
  fieldRegexTitle: string

  @IsString()
  @IsOptional()
  fieldRegexType: string

  @IsString()
  @IsOptional()
  fieldRegexAddress: string

  @IsString()
  @IsOptional()
  fieldRegexEmail: string

  @IsString()
  @IsOptional()
  fieldRegexPhone: string

  @IsString()
  @IsOptional()
  fieldRegexPersonInFoundationToCreate: string

  @IsString()
  @IsOptional()
  cronUpdateFrequency: string

  @IsString()
  @IsOptional()
  fieldRegexPersonQuality: string

  @IsString()
  @IsOptional()
  fieldRegexPersonCivility: string

  @IsString()
  @IsOptional()
  fieldRegexPersonFirstName: string

  @IsString()
  @IsOptional()
  fieldRegexPersonLastName: string

  @IsString()
  @IsOptional()
  fieldRegexPersonBornAt: string

  @IsString()
  @IsOptional()
  fieldRegexPersonBornPlace: string

  @IsString()
  @IsOptional()
  fieldRegexPersonNationality: string

  @IsString()
  @IsOptional()
  fieldRegexPersonProfession: string

  @IsString()
  @IsOptional()
  fieldRegexPersonAddress: string

  @IsString()
  @IsOptional()
  fieldRegexPersonPhone: string

  @IsString()
  @IsOptional()
  fieldRegexPersonRole: string

  @IsString()
  @IsOptional()
  fieldRegexAdministator: string

  @IsString()
  @IsOptional()
  fieldRegexDepartment: string

  //#endregion regex code champs
}
