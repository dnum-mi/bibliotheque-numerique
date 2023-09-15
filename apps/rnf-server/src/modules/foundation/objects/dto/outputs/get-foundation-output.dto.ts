import { AddressEntity } from '@/shared/objects/address/address.entity'
import { FoundationEntity } from '@/modules/foundation/objects/foundation.entity'
import { OmitType } from '@nestjs/swagger'
import { FileStorageOutputDto } from '@/modules/file-storage/objects/dto/outputs/file-storage-output.dto'

export class GetFoundationOutputDto extends OmitType(FoundationEntity, ['persons', 'addressId', 'status']) {
  address: AddressEntity
  status?: FileStorageOutputDto | null
}
