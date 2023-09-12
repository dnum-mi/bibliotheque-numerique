import { Champ, PieceJustificativeChamp } from '@dnum-mi/ds-api-client'
import { AddressChamp } from '@dnum-mi/ds-api-client/dist/@types/types'
import { Mapper } from '@/modules/ds/objects/types/mapper.type'

const stringValue = (ch?: Champ) => ch?.stringValue ?? null

export const universalMapper: Mapper = {
  title: stringValue,
  email: stringValue,
  phone: stringValue,
  type: stringValue,
  address: (ch?: AddressChamp) => {
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
  status: (champ?: PieceJustificativeChamp) => {
    if (!champ || champ.__typename !== 'PieceJustificativeChamp' || !champ.file) {
      return null
    }
    const file = champ.file
    return {
      fileUrl: file.url,
      originalName: file.filename,
      mimeType: file.contentType,
      checksum: file.checksum,
      byteSize: Number(file.byteSizeBigInt as string),
    }
  },
}
