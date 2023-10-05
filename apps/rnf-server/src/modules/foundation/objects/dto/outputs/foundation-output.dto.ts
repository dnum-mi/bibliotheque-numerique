import { FoundationEntity } from '@/modules/foundation/objects/foundation.entity'
import { OmitType } from '@nestjs/swagger'
import {
  GetPersonInFoundationOutputDto,
} from '@/modules/person/objects/dto/outputs/get-person-in-foundation-output.dto'

export class FoundationOutputDto extends OmitType(FoundationEntity, ['persons'] as const) {
  persons?: GetPersonInFoundationOutputDto[]
}
