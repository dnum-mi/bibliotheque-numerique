import { AddressEntity } from '@/shared/objects/address/address.entity'
import { FoundationEntity } from '@/modules/foundation/objects/foundation.entity'
import { OmitType } from '@nestjs/swagger'
import { FileStorageEntity } from '@/modules/file-storage/objects/entities/file-storage.entity'

export class GetFoundationOutputDto extends OmitType(FoundationEntity, ['persons', 'addressId']) {
  address: AddressEntity
  status?: FileStorageEntity
}
