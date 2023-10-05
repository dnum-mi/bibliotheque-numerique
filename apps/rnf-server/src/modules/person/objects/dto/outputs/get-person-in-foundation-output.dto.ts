import { PickType } from '@nestjs/swagger'
import { PersonInFoundationEntity } from '@/modules/foundation/objects/person-in-foundation.entity'

export class GetPersonInFoundationOutputDto extends PickType(PersonInFoundationEntity, ['person', 'roles'] as const) {
}
