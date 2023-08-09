import { AddressEntity } from '@/shared/objects/address/address.entity'
import { FoundationEntity } from '@/modules/foundation/objects/foundation.entity'
import { OmitType } from '@nestjs/swagger'

export class GetFoundationOutputDto extends OmitType(FoundationEntity, ['persons', 'addressId']) {
  address: AddressEntity
}
