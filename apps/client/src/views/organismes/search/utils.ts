import type { IFoundationOutput, ISiafOrganisme } from '@biblio-num/shared'

export const extractAddressInfo = (entity: ISiafOrganisme | IFoundationOutput) => {
  const defaultValue = 'N/A'

  if (!('address' in entity) || !entity.address) {
    return { ville: defaultValue, codePostal: defaultValue }
  }

  const dsAddress = entity.address.dsAddress
  const rnaAddress = entity.address.rnaAddress?.address
  const gouvAddress = entity.address.rnaAddress?.gouvAddress

  let codePostal = dsAddress?.postalCode ?? gouvAddress?.postcode ?? rnaAddress?.codepostal
  let ville = dsAddress?.cityName ?? gouvAddress?.city ?? rnaAddress?.libcommune

  if (!codePostal || !ville) {
    const addressOneLine = entity.address.oneLine ?? ''
    const codePostalMatch = addressOneLine.match(/\b\d{5}\b/)

    codePostal = codePostal ?? (codePostalMatch ? codePostalMatch[0] : defaultValue)
    ville = ville ?? (codePostalMatch ? addressOneLine.split(codePostalMatch[0])[1]?.trim() : defaultValue)
  }

  return {
    ville: ville ?? defaultValue,
    codePostal: codePostal ?? defaultValue,
  }
}
