import { Champ } from '@dnum-mi/ds-api-client'
import { AddressChamp } from '@dnum-mi/ds-api-client/dist/@types/types'
import { Mapper } from '@/modules/ds/objects/types/mapper.type'

const stringValue = (ch: Champ | null) => ch?.stringValue ?? null

export const universalMapper: Mapper = {
  title: stringValue,
  email: stringValue,
  phone: stringValue,
  type: stringValue,
  // @ts-expect-error todo: fix this
  address: (ch: AddressChamp | null) => {
    if (!ch || ch.__typename !== 'AddressChamp' || !ch.address) {
      return null
    }
    const address = ch.address
    return {
      label: address.label,
      type: address.type,
      streetAddress: address.streetAddress ?? null,
      streetNumber: address.streetNumber ?? null,
      streetName: address.streetName ?? null,
      postalCode: address.postalCode,
      cityName: address.cityName,
      cityCode: address.cityCode,
      departmentName: address.departmentName ?? null,
      departmentCode: address.departmentCode ?? null,
      regionName: address.regionName ?? null,
      regionCode: address.regionCode ?? null,
    }
  },
  personInFoundationToCreate: (ch: Champ) => null,
}
