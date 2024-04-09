import {
  Champ,
  CustomChamp,
  DateChamp,
  PieceJustificativeChamp,
} from '@dnum-mi/ds-api-client'
import { AddressChamp } from '@dnum-mi/ds-api-client/dist/@types/types'
import { Mapper } from '@/modules/ds/objects/types/mapper.type'

export const stringValue = (ch?: Champ | CustomChamp) => ch?.stringValue ?? null

export const dateValue = (ch?: DateChamp) =>
  ch?.date ? new Date(ch.date as string) : null

export const booleanValue = (ch?: Champ | CustomChamp) =>
  ch?.stringValue === 'true'

export const addressValue = (ch?: AddressChamp) => {
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
}

export const universalMapper: Mapper = {
  title: stringValue,
  email: stringValue,
  phone: stringValue,
  type: stringValue,
  address: addressValue,
  declarationYears: (champ) =>
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    (champ as unknown as { rows: { declarationYears: Champ }[] })?.rows
      .map((row: { declarationYears: Champ }) =>
        parseInt(row.declarationYears.stringValue!, 10),
      )
      .filter((y) => !isNaN(y)) ?? [],
  personInFoundationToCreate: () => null,
  status: (champ?: PieceJustificativeChamp) => {
    if (!champ?.file || champ.__typename !== 'PieceJustificativeChamp') {
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
  personQuality: stringValue,
  personCivility: stringValue,
  personFirstName: stringValue,
  personLastName: stringValue,
  personBornAt: dateValue,
  personBornPlace: stringValue,
  personNationality: stringValue,
  personProfession: stringValue,
  personAddress: addressValue,
  personPhone: stringValue,
  personIsFounder: booleanValue,
  personRole: stringValue,
  personAdministrator: stringValue,
  fiscalEndDateAt: dateValue,
}
