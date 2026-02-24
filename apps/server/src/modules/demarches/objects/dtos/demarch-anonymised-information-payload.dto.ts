import { Demarche } from '@/modules/demarches/objects/entities/demarche.entity'
import { PickType } from '@nestjs/mapped-types'

export const demarcheAnonymisedInformationPayloadDtoKeys = [
  'title',
  'id',
  'dsId',
  'nbrMonthAnonymisation',
  'anonymizationEvent',
  'mappingAnonymized',
] satisfies (keyof Demarche)[]

export class DemarcheAnonymisedInformationPayloadDto
  extends PickType(Demarche, demarcheAnonymisedInformationPayloadDtoKeys) {
}
