import { PersonEntity } from '@/modules/person/objects/person.entity'
import { PickType } from '@nestjs/swagger'
import { ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { CreateAddressDto } from '@/shared/objects/address/create-address.dto'

export const createPersonDtoKeys: (keyof PersonEntity)[] = ['firstName', 'lastName', 'email', 'phone']

export class CreatePersonDto extends PickType(PersonEntity, createPersonDtoKeys) {
  @ValidateNested()
  @Type(() => CreateAddressDto)
    address: CreateAddressDto
}
